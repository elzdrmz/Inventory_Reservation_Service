import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class InventoryMonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda function for checking low stock
    const checkLowStockLambda = new lambda.Function(this, 'CheckLowStockLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/check-low-stock')),
      timeout: cdk.Duration.minutes(5),
      environment: {
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-reservation',
      },
      description: 'Checks for products with low or zero stock every 6 hours',
    });

    // Grant permissions if needed
    checkLowStockLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: ['*'],
      })
    );

    // Create EventBridge rule that runs every 6 hours
    const rule = new events.Rule(this, 'CheckLowStockRule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(6)),
      description: 'Triggers Lambda to check for low stock every 6 hours',
    });

    // Add Lambda as target
    rule.addTarget(new targets.LambdaFunction(checkLowStockLambda));

    // Outputs
    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: checkLowStockLambda.functionName,
      description: 'Name of the CheckLowStock Lambda function',
    });

    new cdk.CfnOutput(this, 'EventRuleName', {
      value: rule.ruleName,
      description: 'Name of the EventBridge rule',
    });
  }
}
