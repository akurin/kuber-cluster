import * as cdk from '@aws-cdk/core';
import {Bucket} from "@aws-cdk/aws-s3";
import {CfnOutput} from "@aws-cdk/core";

export class KuberClusterStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const kopsBucket = new Bucket(this, 'KuberBucket', {versioned: true});

        new CfnOutput(this, "KopsBucket", {value: kopsBucket.bucketName});
    }
}
