# Infrastructure Setup for Azure Deployment

This document outlines a minimal infrastructure setup using Azure for deploying applications, suitable for learning purposes.

## Prerequisites
- An Azure account (you can sign up for a free account)
- Basic knowledge of Azure services

## Infrastructure Components
1. **Azure App Service**: Use Azure App Service to host your web applications. It provides a fully managed platform for building, deploying, and scaling your web apps.

2. **Azure SQL Database**: For applications needing a relational database, Azure SQL Database is a scalable, managed database service.

3. **Azure Storage**: Use Azure Blob Storage to store unstructured data like images, videos, and documents.

## Steps for Basic App Deployment
1. **Create Azure App Service**:
   - Go to the Azure portal.
   - Click on 'Create a Resource'.
   - Select 'Web App' under the 'Web' category.
   - Fill in the required details (Subscription, Resource Group, and App Name).
   - Select a runtime stack and click 'Review + Create'.

2. **Deploy Your Application**:
   - You can deploy your application using various methods like Azure DevOps, GitHub Actions, or direct ZIP upload.
   - For GitHub Actions:
     - Create a `.github/workflows/azure.yml` file in your repository.
     - Use the following template to set up your workflow:
       ```yaml
       name: Azure Web Apps Deploy
       on:
         push:
           branches:
             - main
       jobs:
         build:
           runs-on: ubuntu-latest
           steps:
             - name: Checkout code
               uses: actions/checkout@v2
             - name: Setup Node.js
               uses: actions/setup-node@v2
               with:
                 node-version: '14'
             - name: Build
               run: |
                 npm install
                 npm run build
             - name: Deploy to Azure Web App
               uses: azure/webapps-deploy@v2
               with:
                 app-name: <your-app-name>
                 publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
                 package: .
       ```
   - Replace `<your-app-name>` with the name of your Azure App Service.
   - Make sure to set up the Azure publish profile in the GitHub secrets.

3. **Monitor and Scale**: Use Azure Monitor and Azure Application Insights to monitor the performance and usage of your application. You can scale your App Service plan as needed based on traffic.

## Conclusion
This minimal setup will help you get started with deploying applications on Azure. As you grow more comfortable, explore other Azure services and their advanced features.
