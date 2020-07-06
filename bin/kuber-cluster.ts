#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { KuberClusterStack } from '../lib/kuber-cluster-stack';

const app = new cdk.App();
new KuberClusterStack(app, 'KuberClusterStack');
