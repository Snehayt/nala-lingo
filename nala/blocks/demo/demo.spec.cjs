module.exports = {
  FeatureName: 'Demo Block',
  features: [
    {
      tcid: '0',
      name: '@demo-basic',
      // ✅ Default path to let you run the demo test after onboarding
      path: 'https://main--da-express-milo--adobecom.aem.page/express/fragments/drafts/test/testpagemarketselector=express&milolibs=acommarketselector',
      // 💡 Replace with your project-specific test page after onboarding
      // Example: path: '/drafts/nala/blocks/accordion/accordion-page',
      data: {
        headerText: 'Nala Demo Test',
      },
      tags: '@demo @smoke',
    },
  ],
};
