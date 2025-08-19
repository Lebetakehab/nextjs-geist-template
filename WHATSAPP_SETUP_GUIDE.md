# WhatsApp Cloud API Connection Guide

## Complete Setup Manual for WhatsApp Business Platform Integration

This guide provides step-by-step instructions for connecting your WhatsApp Campaign Manager to the official WhatsApp Business Platform (Cloud API via Meta Graph).

---

## Prerequisites

Before starting, ensure you have:
- A Facebook Business Manager account
- A verified WhatsApp Business Account (WABA)
- A phone number dedicated to WhatsApp Business
- Admin access to your Facebook Business Manager

---

## Step 1: Create Facebook App with WhatsApp Business API Access

### 1.1 Access Facebook Developers Console
1. Go to [Facebook Developers Console](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in your app details:
   - **App Name**: Your campaign manager app name
   - **App Contact Email**: Your business email
   - **Business Manager Account**: Select your business account

### 1.2 Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. This will add WhatsApp Business API to your app

### 1.3 Get App Credentials
1. Go to "App Settings" → "Basic"
2. Note down:
   - **App ID**: Your Facebook App ID
   - **App Secret**: Click "Show" to reveal (keep this secure!)

---

## Step 2: Configure WhatsApp Business Account

### 2.1 Access WhatsApp Business API Setup
1. In your Facebook App, go to "WhatsApp" → "Getting Started"
2. Select your Business Manager account
3. Create or select a WhatsApp Business Account (WABA)

### 2.2 Add Phone Number
1. Click "Add phone number"
2. Enter your business phone number
3. Complete the verification process via SMS/call
4. Note down the **Phone Number ID** (not the phone number itself)

### 2.3 Get Business Account ID
1. In the WhatsApp setup, note the **WhatsApp Business Account ID**
2. This is different from your phone number - it's a unique identifier

---

## Step 3: Generate Access Token

### 3.1 Temporary Token (for testing)
1. In WhatsApp setup, go to "API Setup"
2. You'll see a temporary access token
3. **Important**: This expires in 24 hours - only for initial testing

### 3.2 Permanent Token (for production)
1. Go to "System Users" in Facebook Business Manager
2. Create a new system user or select existing
3. Assign the system user to your app
4. Generate a permanent access token with these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

---

## Step 4: Setup Webhook (Required for Message Status)

### 4.1 Configure Webhook URL
1. In your app's WhatsApp settings, go to "Configuration"
2. Set **Webhook URL** to: `https://yourdomain.com/api/webhooks/whatsapp`
3. Set **Verify Token**: Create a random string (save this!)

### 4.2 Subscribe to Webhook Events
Subscribe to these events:
- `messages` - Incoming messages
- `message_deliveries` - Delivery receipts
- `message_reads` - Read receipts
- `message_reactions` - Message reactions

---

## Step 5: Configure in WhatsApp Campaign Manager

### 5.1 Access Setup Wizard
1. Open your WhatsApp Campaign Manager
2. Navigate to "WhatsApp Setup" in the main menu
3. Follow the 4-step wizard

### 5.2 Enter Credentials
**Step 1: Facebook App Credentials**
- Enter your App ID and App Secret

**Step 2: WhatsApp Business Details**
- **WABA ID**: Your WhatsApp Business Account ID
- **Phone Number ID**: The ID of your verified phone number
- **Access Token**: Your permanent access token

**Step 3: Webhook Configuration**
- Copy the provided webhook URL to your Facebook app
- Enter the webhook verify token you created

**Step 4: Test Connection**
- Click "Test Connection" to verify everything works
- You should see a green "Connected" status

---

## Step 6: Environment Configuration

### 6.1 Production Environment Variables
Update your `.env.local` file:

```env
# Switch to production mode
USE_MOCK_WHATSAPP="false"

# WhatsApp Business Cloud API Configuration
WHATSAPP_APP_ID="your_app_id_here"
WHATSAPP_APP_SECRET="your_app_secret_here"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_waba_id_here"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id_here"
WHATSAPP_ACCESS_TOKEN="your_permanent_access_token_here"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_webhook_verify_token_here"

# Update webhook URL for production
WEBHOOK_BASE_URL="https://yourdomain.com"
```

### 6.2 Development vs Production Toggle
- Set `USE_MOCK_WHATSAPP="true"` for development with mock APIs
- Set `USE_MOCK_WHATSAPP="false"` for production with real WhatsApp API

---

## Step 7: Message Templates (Required for Marketing)

### 7.1 Create Message Templates
1. Go to WhatsApp Manager: [business.facebook.com](https://business.facebook.com)
2. Select your WhatsApp Business Account
3. Go to "Message Templates"
4. Create templates for your campaigns

### 7.2 Template Requirements
- All marketing messages must use approved templates
- Templates must be approved by Meta before use
- Include proper opt-out instructions
- Follow WhatsApp Business Policy

---

## Step 8: Compliance and Best Practices

### 8.1 Opt-in Requirements
- **CRITICAL**: Only message users who have opted in
- Maintain opt-in records with timestamps
- Provide clear opt-out mechanisms

### 8.2 Rate Limits
- Start with 250 messages per day
- Limits increase based on phone number quality rating
- Monitor your quality rating in WhatsApp Manager

### 8.3 Message Categories
- **Marketing**: Requires approved templates, 24-hour window
- **Utility**: Service notifications, approved templates
- **Authentication**: OTP and verification codes

---

## Troubleshooting

### Common Issues

**"Invalid Phone Number ID"**
- Verify the Phone Number ID (not the actual phone number)
- Ensure the number is verified in WhatsApp Business

**"Access Token Expired"**
- Generate a new permanent token from System Users
- Temporary tokens expire in 24 hours

**"Webhook Verification Failed"**
- Check webhook URL is accessible
- Verify the webhook verify token matches
- Ensure HTTPS is used for production

**"Template Not Found"**
- Ensure templates are approved in WhatsApp Manager
- Use exact template name and language code

### Testing Your Setup

1. **Connection Test**: Use the built-in connection test in the setup wizard
2. **Send Test Message**: Try sending to your own WhatsApp number
3. **Webhook Test**: Check webhook logs for incoming events
4. **Template Test**: Send a template message to verify approval

---

## Security Considerations

### 8.1 Protect Your Credentials
- Never commit access tokens to version control
- Use environment variables for all sensitive data
- Rotate access tokens regularly
- Monitor access logs

### 8.2 Webhook Security
- Verify webhook signatures from Meta
- Use HTTPS for all webhook endpoints
- Implement rate limiting on webhook endpoints

---

## Support and Resources

### Official Documentation
- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Meta Business Help Center](https://www.facebook.com/business/help)

### API References
- [WhatsApp Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/webhooks)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)

### Getting Help
1. Check the troubleshooting section above
2. Review Meta's official documentation
3. Contact Meta Business Support for API issues
4. Check your app's error logs for detailed error messages

---

## Quick Reference

### Essential URLs
- Facebook Developers: https://developers.facebook.com/
- WhatsApp Manager: https://business.facebook.com/
- Business Manager: https://business.facebook.com/settings/

### Key IDs to Collect
- ✅ Facebook App ID
- ✅ Facebook App Secret  
- ✅ WhatsApp Business Account ID (WABA ID)
- ✅ Phone Number ID
- ✅ Permanent Access Token
- ✅ Webhook Verify Token

### Environment Variables Checklist
- ✅ `USE_MOCK_WHATSAPP="false"`
- ✅ `WHATSAPP_APP_ID`
- ✅ `WHATSAPP_APP_SECRET`
- ✅ `WHATSAPP_BUSINESS_ACCOUNT_ID`
- ✅ `WHATSAPP_PHONE_NUMBER_ID`
- ✅ `WHATSAPP_ACCESS_TOKEN`
- ✅ `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- ✅ `WEBHOOK_BASE_URL`

---

*This guide ensures full compliance with WhatsApp Business Platform policies and provides a production-ready setup for your marketing campaigns.*
