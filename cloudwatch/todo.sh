#!/bin/bash
# ssh root@MachineB 'bash -s' < todo.sh.sh
# scp /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json :/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo apt-get update
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i ./amazon-cloudwatch-agent.deb
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent


#      sudo apt-get update
#      wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
#      sudo dpkg -i ./amazon-cloudwatch-agent.deb
#      sudo apt-get install -y --no-install-recommends collectd
#      sudo bash -c 'echo ${agentConfigEncoded} | base64 -d > opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'
#      sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
#      sudo systemctl start amazon-cloudwatch-agent"
#      sudo systemctl enable amazon-cloudwatch-agent"
