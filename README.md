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

## Cloudformation commands

```shell script
cdk deploy --profile personal
```

## Kops commands

```shell script
export AWS_DEFAULT_PROFILE=personal
export AWS_PROFILE=personal

KOPS_STATE_STORE=s3://$(aws cloudformation describe-stacks \
    --stack-name kops-bucket \
    --query "Stacks[0].Outputs[?OutputKey=='KopsBucket'].OutputValue" \
    --output text)

export KOPS_STATE_STORE

kops create cluster \
--name kuber.morjoff.com \
--zones us-east-1a
--master-size t3a.nano \
--node-size t3a.nano

# Create Kops template
kops create cluster \
    --name kuber.morjoff.com \
    --zones us-east-1a \
    --master-size t3a.nano \
    --node-size t3a.nano \
    --dry-run \
    -o yaml > kuber.morjoff.com.yaml

kops create -f kuber.morjoff.com.yaml
kops create secret --name kuber.morjoff.com sshpublickey admin -i ~/.ssh/id_rsa.pub
kops rolling-update cluster kuber.morjoff.com --yes
````

Suggestions:
 * validate cluster: kops validate cluster
 * list nodes: kubectl get nodes --show-labels
 * ssh to the master: ssh -i ~/.ssh/id_rsa admin@api.kuber.morjoff.com
 * the admin user is specific to Debian. If not using Debian please use the appropriate user based on your OS.
 * read about installing addons at: https://github.com/kubernetes/kops/blob/master/docs/operations/addons.md.

## Install Kubernetes UI

```shell script
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml

kubectl apply -f dashboard/admin-user.yml

kubectl apply -f dashboard/role-binding.yml

# Get token
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
```