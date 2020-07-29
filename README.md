# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## CloudFormation commands

```shell script
cdk deploy --profile personal
```

## K3S commands

```shell script
MASTER_NODE_PUBLIC_IP=$(aws cloudformation describe-stacks \
    --stack-name kops-bucket \
    --query "Stacks[0].Outputs[?OutputKey=='MasterNodePublicIp'].OutputValue" \
    --output text \
    --profile personal)

K3S_CONN_STRING=$(aws ssm get-parameter \
    --name K3SConnectionString \
    --query "Parameter.Value" \
    --output text \
    --profile personal)

k3sup install --ip $MASTER_NODE_PUBLIC_IP --user ec2-user --k3s-extra-args "--datastore-endpoint=$K3S_CONN_STRING"
```
