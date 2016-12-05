# slack-age

To deploy you will need:
 * Install Terraform for deployment (https://www.terraform.io/downloads.html)
 * An AWS account and access key to create an API Gateway, Lambda, and IAM Role (http://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html)
 * An imgflip account to access their image API (https://imgflip.com/)
 * A custom Slash Command for Slack with authentication token (https://api.slack.com/slash-commands)

To setup, run `terraform get`

To deploy or update, run `terraform apply -var 'slack_token=XYZ' -var 'imgflip_user=XYZ' -var 'imgflip_pass=XYZ'`

To delete the created resources, run `terraform destroy`