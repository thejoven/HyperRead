# Test External Links

This is a test document to verify that external links work properly in the markdown reader.

## External Links to Test

1. [GitHub](https://github.com) - Should open in system browser
2. [Google](https://www.google.com) - Should open in system browser  
3. [Stack Overflow](https://stackoverflow.com) - Should open in system browser
4. [OpenAI](https://openai.com) - Should open in system browser

## Internal Anchor Links (should work differently)

- [Go to External Links section](#external-links-to-test)
- [Go to top](#test-external-links)

## Expected Behavior

When you click on the external links (1-4), they should:
- Open in your system's default browser
- NOT open within the Electron app itself
- Show debug logs in the console

The anchor links should scroll within the document.