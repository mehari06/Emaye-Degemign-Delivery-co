param(
  [Parameter(Mandatory = $true)]
  [string]$BotToken,
  [Parameter(Mandatory = $true)]
  [string]$AppBaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$WebhookSecret
)

$ErrorActionPreference = "Stop"

if ($AppBaseUrl.EndsWith("/")) {
  $AppBaseUrl = $AppBaseUrl.TrimEnd("/")
}

$payload = @{
  url          = "$AppBaseUrl/api/telegram/webhook"
  secret_token = $WebhookSecret
}

Write-Host "Setting webhook to $($payload.url)"

Invoke-RestMethod `
  -Method Post `
  -Uri "https://api.telegram.org/bot$BotToken/setWebhook" `
  -ContentType "application/json" `
  -Body ($payload | ConvertTo-Json)
