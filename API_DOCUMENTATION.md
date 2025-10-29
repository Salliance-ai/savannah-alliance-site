# Comprehensive API Documentation

This document provides comprehensive documentation for all public APIs, functions, and components in the Savannah Alliance codebase.

---

## Table of Contents

1. [Frontend JavaScript APIs](#frontend-javascript-apis)
2. [Backend Ruby/Sinatra APIs](#backend-rubysinatra-apis)
3. [HTML Components](#html-components)
4. [Utility Functions](#utility-functions)

---

## Frontend JavaScript APIs

### Contact Form Submission Handler

**Location:** `index.html` (lines 147-177)

**Description:** Handles form submission for the contact form, sending data to a serverless endpoint via fetch API.

**Public API:**

```javascript
document.getElementById('contact-form').addEventListener('submit', function(e) {
  // Event handler function
})
```

**Parameters:**
- `e` (Event): The submit event object containing form data

**Behavior:**
- Prevents default form submission
- Extracts form data (name, email, company, message)
- Sends POST request to serverless endpoint
- Displays success/error messages
- Resets form on successful submission

**Request Format:**
```json
{
  "name": "string",
  "email": "string",
  "company": "string",
  "message": "string"
}
```

**Endpoint:** `https://your-serverless-endpoint.com/submit`

**HTTP Method:** POST

**Headers:**
- `Content-Type: application/json`

**Response Handling:**
- Success (HTTP 200): Displays "Message sent successfully!" in green and resets form
- Error: Displays "Error sending message. Please try again." in red
- Network Error: Displays "Error sending message. Please check your connection." in red

**Example Usage:**

```html
<form id="contact-form">
  <input type="text" name="name" placeholder="Full Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="text" name="company" placeholder="Company">
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send Message</button>
  <p id="form-status"></p>
</form>
```

**Status Display Element:**
- Element ID: `form-status`
- Location: Paragraph element immediately after submit button
- Styling: Color changes to green (success) or red (error)

---

## Backend Ruby/Sinatra APIs

### Create Checkout Session Endpoint

**Location:** `extracted_stripe/server.rb` (lines 12-27)

**Description:** Creates a Stripe Checkout Session for payment processing. This endpoint initializes a checkout session with line items, payment mode, and redirect URLs.

**Public API:**

```ruby
post '/create-checkout-session' do
  # Endpoint handler
end
```

**HTTP Method:** POST

**Path:** `/create-checkout-session`

**Content-Type:** `application/json`

**Request Body:** None (uses form POST from checkout page)

**Response:**
- Status Code: 303 (See Other - Redirect)
- Redirect Location: Stripe Checkout Session URL
- Format: HTTP Redirect

**Configuration:**

```ruby
YOUR_DOMAIN = 'http://localhost:4242'
Stripe.api_key = 'sk_test_...'  # Test secret API key
```

**Stripe Session Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `line_items` | Array | Array of line item objects | Yes |
| `line_items[].price` | String | Stripe Price ID (e.g., `price_1234`) | Yes |
| `line_items[].quantity` | Integer | Quantity of items (default: 1) | Yes |
| `mode` | String | Checkout mode (`'payment'` for one-time) | Yes |
| `success_url` | String | URL to redirect after successful payment | Yes |
| `cancel_url` | String | URL to redirect if payment is cancelled | Yes |
| `automatic_tax` | Object | Tax configuration (enabled: true) | Optional |

**Example Request:**

```bash
curl -X POST http://localhost:4242/create-checkout-session \
  -H "Content-Type: application/json"
```

**Example Response:**
- HTTP 303 Redirect to Stripe Checkout URL
- User is redirected to Stripe-hosted checkout page

**Usage Flow:**

1. User clicks "Checkout" button on `/checkout.html`
2. Form POST request sent to `/create-checkout-session`
3. Backend creates Stripe Checkout Session
4. User redirected to Stripe checkout page
5. After payment, user redirected to `/success.html` or `/cancel.html`

**Setup Requirements:**

1. Replace `{{PRICE_ID}}` in `server.rb` with actual Stripe Price ID
2. Set Stripe API key (test or production)
3. Configure `YOUR_DOMAIN` for production use

**Error Handling:**
- Stripe API errors will be raised as exceptions
- Consider adding error handling and logging

---

## HTML Components

### Contact Form Component

**Location:** `index.html` (lines 123-130)

**Component ID:** `contact-form`

**Fields:**

| Field Name | Type | Placeholder | Required |
|------------|------|-------------|-----------|
| `name` | text | "Full Name" | Yes |
| `email` | email | "Email" | Yes |
| `company` | text | "Company" | No |
| `message` | textarea | "Message" | No |

**Structure:**
```html
<form id="contact-form">
  <input type="text" name="name" placeholder="Full Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="text" name="company" placeholder="Company">
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send Message</button>
  <p id="form-status"></p>
</form>
```

**Styling:**
- Inputs and textarea have full width
- 10px padding, 10px margin-bottom
- Border: 1px solid #ccc
- Border-radius: 6px

**Button Styling:**
- Background: #19A69A (teal)
- Color: white
- Padding: 12px 20px
- Border-radius: 6px
- Font-weight: 600

**Status Display:**
- Element ID: `form-status`
- Dynamically updated with success/error messages
- Color changes based on result (green/red)

---

### Checkout Form Component

**Location:** `extracted_stripe/public/checkout.html`

**Description:** Product checkout page with Stripe integration

**Structure:**
```html
<form action="/create-checkout-session" method="POST">
  <button type="submit" id="checkout-button">Checkout</button>
</form>
```

**Product Display:**
- Product image (from imgur.com)
- Product title: "Stubborn Attachments"
- Price: $20.00
- Layout: Flex container with image and description

**Form Action:** `/create-checkout-session`
**Form Method:** POST

**Button:**
- ID: `checkout-button`
- Styling: Blue background (#556cd6), white text
- Hover effect: opacity 0.8

---

### Success Page Component

**Location:** `extracted_stripe/public/success.html`

**Description:** Post-payment success confirmation page

**Content:**
- Thank you message
- Contact email: `orders@example.com`
- Styled with `style.css`

**Usage:**
- Automatically displayed after successful Stripe payment
- Configured in `server.rb` as `success_url`

---

### Cancel Page Component

**Location:** `extracted_stripe/public/cancel.html`

**Description:** Payment cancellation page

**Content:**
- Cancellation message
- Encourages user to return and complete purchase
- Styled with `style.css`

**Usage:**
- Automatically displayed when user cancels Stripe checkout
- Configured in `server.rb` as `cancel_url`

---

## Utility Functions

### Navigation Click Handlers

**Location:** `index.html` (lines 58, 123)

**Functions:**

```javascript
// Scroll to services section
location.href='#services'

// Scroll to contact section
location.href='#contact'

// Phone link
href="tel:+18335025246"
```

**Description:** Smooth scrolling navigation links for section anchors

**Anchor Points:**
- `#services` - Services section
- `#industries` - Industries section
- `#about` - About section
- `#clients` - Clients section
- `#contact` - Contact section

---

## Integration Examples

### Complete Contact Form Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contact Form Example</title>
</head>
<body>
  <form id="contact-form">
    <input type="text" name="name" placeholder="Full Name" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="text" name="company" placeholder="Company">
    <textarea name="message" placeholder="Message"></textarea>
    <button type="submit">Send Message</button>
    <p id="form-status"></p>
  </form>

  <script>
    document.getElementById('contact-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const form = e.target;
      const status = document.getElementById('form-status');

      fetch('https://your-serverless-endpoint.com/submit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          company: form.company.value,
          message: form.message.value
        })
      })
      .then(response => {
        if(response.ok) {
          status.textContent = 'Message sent successfully!';
          status.style.color = 'green';
          form.reset();
        } else {
          status.textContent = 'Error sending message. Please try again.';
          status.style.color = 'red';
        }
      })
      .catch(() => {
        status.textContent = 'Error sending message. Please check your connection.';
        status.style.color = 'red';
      });
    });
  </script>
</body>
</html>
```

### Complete Stripe Checkout Integration

**Frontend (checkout.html):**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Product Checkout</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <section>
      <div class="product">
        <img src="https://i.imgur.com/EHyR2nP.png" alt="Product" />
        <div class="description">
          <h3>Product Name</h3>
          <h5>$20.00</h5>
        </div>
      </div>
      <form action="/create-checkout-session" method="POST">
        <button type="submit" id="checkout-button">Checkout</button>
      </form>
    </section>
  </body>
</html>
```

**Backend (server.rb):**
```ruby
require 'stripe'
require 'sinatra'

Stripe.api_key = 'sk_test_YOUR_KEY_HERE'
YOUR_DOMAIN = 'http://localhost:4242'

post '/create-checkout-session' do
  content_type 'application/json'

  session = Stripe::Checkout::Session.create({
    line_items: [{
      price: 'price_YOUR_PRICE_ID',
      quantity: 1,
    }],
    mode: 'payment',
    success_url: YOUR_DOMAIN + '/success.html',
    cancel_url: YOUR_DOMAIN + '/cancel.html',
    automatic_tax: {enabled: true},
  })
  redirect session.url, 303
end
```

---

## Configuration Requirements

### Frontend Contact Form

1. **Endpoint Configuration:**
   - Update `https://your-serverless-endpoint.com/submit` with actual endpoint
   - Ensure endpoint accepts POST requests with JSON body
   - Endpoint should handle CORS if needed

2. **Form Validation:**
   - Required fields: `name`, `email`
   - Optional fields: `company`, `message`
   - Client-side validation via HTML5 `required` attribute

### Backend Stripe Integration

1. **Stripe Setup:**
   - Replace `{{PRICE_ID}}` with actual Stripe Price ID
   - Set `Stripe.api_key` to your test or production secret key
   - Create products and prices in Stripe Dashboard

2. **Domain Configuration:**
   - Update `YOUR_DOMAIN` for production environment
   - Ensure success and cancel URLs are accessible
   - Configure webhook endpoints for payment events (recommended)

3. **Server Configuration:**
   - Port: 4242 (default)
   - Static files served from `public/` directory
   - Run with: `ruby server.rb -o 0.0.0.0`

---

## Error Handling

### Frontend Errors

**Network Errors:**
- Catches fetch failures
- Displays user-friendly error message
- Preserves form data (does not reset on error)

**HTTP Errors:**
- Checks response.ok status
- Displays error message
- Does not reset form

### Backend Errors

**Missing Implementation:**
- Stripe API errors not currently handled
- Recommend adding error handling:

```ruby
post '/create-checkout-session' do
  begin
    session = Stripe::Checkout::Session.create({...})
    redirect session.url, 303
  rescue Stripe::StripeError => e
    status 500
    { error: e.message }.to_json
  end
end
```

---

## Security Considerations

1. **API Keys:**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Current implementation has hardcoded key (should be moved to env var)

2. **Input Validation:**
   - Frontend: HTML5 validation on contact form
   - Backend: No input validation currently implemented
   - Recommend server-side validation for all inputs

3. **CORS:**
   - Ensure proper CORS configuration on API endpoints
   - Contact form endpoint should allow appropriate origins

4. **HTTPS:**
   - Use HTTPS in production for all endpoints
   - Stripe requires HTTPS for live payments

---

## Testing

### Contact Form Testing

```javascript
// Test form submission
const form = document.getElementById('contact-form');
form.name.value = 'Test User';
form.email.value = 'test@example.com';
form.company.value = 'Test Company';
form.message.value = 'Test message';
form.dispatchEvent(new Event('submit'));
```

### Stripe Checkout Testing

```bash
# Test checkout session creation
curl -X POST http://localhost:4242/create-checkout-session \
  -H "Content-Type: application/json"
```

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## Version Information

- **Frontend:** Static HTML with vanilla JavaScript
- **Backend:** Ruby with Sinatra framework
- **Stripe SDK:** Latest Ruby Stripe gem
- **Server:** Sinatra on port 4242

---

## Support and Maintenance

For questions or issues:
- Frontend: Review browser console for JavaScript errors
- Backend: Check server logs for Ruby/Sinatra errors
- Stripe: Check Stripe Dashboard for payment logs
- Contact: info@savannahalliance.com

---

**Last Updated:** 2025-01-27
**Documentation Version:** 1.0
