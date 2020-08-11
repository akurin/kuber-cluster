import * as cdk from "@aws-cdk/core";
import {Duration} from "@aws-cdk/core";
import {HostedZone, RecordSet, RecordTarget, RecordType,} from "@aws-cdk/aws-route53";

export class KuberClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromLookup(this, "HostedZoneLookup", {
      domainName: "morjoff.com",
    });

    new RecordSet(this, "RssRecordSet", {
      zone: zone,
      recordType: RecordType.A,
      recordName: "rss.morjoff.com",
      target: RecordTarget.fromValues("95.217.153.189"),
      ttl: Duration.minutes(1),
    });
  }
}
