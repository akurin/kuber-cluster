import * as cdk from "@aws-cdk/core";
import { CfnOutput, Duration } from "@aws-cdk/core";
import { Certificate, ValidationMethod } from "@aws-cdk/aws-certificatemanager";
import {
  AmazonLinuxGeneration,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  UserData,
  Vpc,
} from "@aws-cdk/aws-ec2";
import { ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { CfnDBCluster } from "@aws-cdk/aws-rds";
import { CfnParameter } from "@aws-cdk/aws-ssm";
import {
  HostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from "@aws-cdk/aws-route53";

export class KuberClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const certificate = new Certificate(this, "Certificate", {
    //   domainName: "*.morjoff.com",
    //   validationMethod: ValidationMethod.DNS
    // });

    // new CfnOutput(this, "WildcardCertificate", {value: certificate.certificateArn});

    const vpc = Vpc.fromLookup(this, "Vpc", {
      isDefault: true,
    });

    // Master node
    const role = new Role(this, "ManagedInstanceRole", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
    });

    const ssmManagedInstance = ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonSSMManagedInstanceCore"
    );
    role.addManagedPolicy(ssmManagedInstance);

    const masterSecurityGroup = new SecurityGroup(this, "SecurityGroup", {
      vpc: vpc,
      allowAllOutbound: true,
    });

    masterSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    masterSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(6443));
    masterSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
    masterSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443));

    let userData = UserData.forLinux();
    userData.addCommands(
      "sudo bash -c 'echo \"ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC0QYZVIpXczWGxH8rJYZcVRKLyDFGvGTs5YCun/nMNlUfgXlWOUO5VJCbjHt1OKhWa8+SSAsoaWZ9USlZUQ1+zkdpK9+/beSLGxRX7q3Og0XfZC3Plt+zC/hu4bKEi4LPLIKVbP1+hkOXemnJdFR4m5gjt9lJMcVZ7hikpu3N0qvifVWu+UwKiUE0gHV1Khp9PWO0isZYQmJDtYQCVWYeqUCqZlcBcZyEYdIxtoXSDYcGNtL/bYAYwe8AMnuqDGAPX/1inw3nBl0mF2ST3EBW0vEaFHzg5okYUGXdAAKIJluM0k9dY1SFYwNcwg6TiMyykDFLGHuX+cYiF7SLHuDCy1Y3OOQi614IjOoSc5ZxOF5OIVpIuTtETogESgyEQzhkFhyVc2J57CVvvj/IIO6naAJ5Euo3Pn9zvmOqpV9w2O1lRMPS6Gy+UQoIKiSZyspH58maaSGYG2KVjW22SIfn43CRmot05fceayjDLyuLuu+pSsUjrZKlKn2C9zCp80aWRIi4AZBLfsupT783O+lTozMIccrTRtkh089pZj7SGZStMIwrAKlhffK7U6pxn8P7w7P3zPc0Vb6PxkYPIL1M0bftExKvp3v71ExMZ6AlVz/XOD0JOeFwdK6Q2wUuZOsFo67ylX5aedQNlJHickcVc8xavrx3aJiKMkJ+KIuzfyw== admin@morjoff.com\" > /home/ec2-user/.ssh/authorized_keys'"
    );

    const instance = new Instance(this, "Instance", {
      vpc: vpc,
      securityGroup: masterSecurityGroup,
      instanceType: InstanceType.of(
        InstanceClass.BURSTABLE3_AMD,
        InstanceSize.MICRO
      ),
      machineImage: MachineImage.latestAmazonLinux({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData: userData,
      role: role,
    });

    new CfnOutput(this, "MasterNodePublicIp", {
      value: instance.instancePublicIp,
    });

    const zone = HostedZone.fromLookup(this, "HostedZoneLookup", {
      domainName: "morjoff.com",
    });
    const target = RecordTarget.fromIpAddresses(instance.instancePublicIp);

    new RecordSet(this, "KuberRecordSet", {
      zone: zone,
      recordType: RecordType.A,
      recordName: "kuber.morjoff.com",
      target: target,
    });

    new RecordSet(this, "RssRecordSet", {
      zone: zone,
      recordType: RecordType.A,
      recordName: "rss.morjoff.com",
      target: target,
      ttl: Duration.minutes(1),
    });

    // Allow VPC incoming connections
    const dbClusterSecurityGroup = new SecurityGroup(
      this,
      "DBClusterSecurityGroup",
      {
        vpc: vpc,
        allowAllOutbound: true,
      }
    );

    dbClusterSecurityGroup.addIngressRule(
      Peer.ipv4(vpc.vpcCidrBlock),
      Port.tcp(3306)
    );

    const dbCluster = new CfnDBCluster(this, "K3SCluster", {
      engine: "aurora",
      engineMode: "serverless",
      port: 3306,
      masterUsername: "master",
      masterUserPassword: process.env.MASTER_USER_PASSWORD,
      databaseName: "k3s",
      enableHttpEndpoint: true,
      vpcSecurityGroupIds: [dbClusterSecurityGroup.securityGroupId],
    });

    // Save Connection String TO SSM
    const connString = `mysql://${dbCluster.masterUsername}:${dbCluster.masterUserPassword}@tcp(${dbCluster.attrEndpointAddress}:${dbCluster.port})/${dbCluster.databaseName}`;

    const connectionStringSSMParameter = new CfnParameter(
      this,
      "K3SConnectionString",
      {
        name: "K3SConnectionString",
        type: "String",
        value: connString,
      }
    );

    connectionStringSSMParameter.addDependsOn(dbCluster);
  }
}
