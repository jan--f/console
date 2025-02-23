import { topologyPage } from '@console/topology/integration-tests/support/pages/topology';
import { devNavigationMenu, addOptions } from '../../constants';
import { formPO, topologyPO } from '../../pageObjects';
import { addPage, gitPage } from '../add-flow';
import { createForm, navigateTo } from '../app';

export const createGitWorkload = (
  gitUrl: string = 'https://github.com/sclorg/nodejs-ex.git',
  componentName: string = 'nodejs-ex-git',
  resourceType: string = 'Deployment',
  appName: string = 'nodejs-ex-git-app',
  isPipelineSelected: boolean = false,
) => {
  addPage.selectCardFromOptions(addOptions.ImportFromGit);
  gitPage.enterGitUrl(gitUrl);
  gitPage.verifyValidatedMessage(gitUrl);
  gitPage.enterComponentName(componentName);
  gitPage.selectResource(resourceType);
  gitPage.enterAppName(appName);
  if (isPipelineSelected === true) {
    gitPage.selectAddPipeline();
  }
  createForm.clickCreate().then(() => {
    cy.get('.co-m-loader').should('not.exist');
    cy.get('body').then(($body) => {
      if ($body.find(formPO.errorAlert).length !== 0) {
        cy.get(formPO.errorAlert)
          .find('.co-pre-line')
          .then(($ele) => {
            cy.log($ele.text());
          });
      } else {
        cy.log(`Workload : "${componentName}" is created`);
      }
    });
  });
};

export const createGitWorkloadIfNotExistsOnTopologyPage = (
  gitUrl: string = 'https://github.com/sclorg/nodejs-ex.git',
  componentName: string = 'nodejs-ex-git',
  resourceType: string = 'Deployment',
  appName?: string,
  isPipelineSelected: boolean = false,
) => {
  navigateTo(devNavigationMenu.Topology);
  topologyPage.waitForLoad();
  cy.get('body').then(($body) => {
    if ($body.find(topologyPO.emptyStateIcon).length) {
      cy.log(`Topology doesn't have workload "${componentName}", lets create it`);
      navigateTo(devNavigationMenu.Add);
      createGitWorkload(gitUrl, componentName, resourceType);
      topologyPage.verifyWorkloadInTopologyPage(componentName);
    } else {
      topologyPage.search(componentName);
      cy.get('body').then(($node) => {
        if ($node.find(topologyPO.highlightNode).length) {
          cy.log(`knative service: ${componentName} is already created`);
        } else {
          navigateTo(devNavigationMenu.Add);
          createGitWorkload(gitUrl, componentName, resourceType, appName, isPipelineSelected);
          topologyPage.verifyWorkloadInTopologyPage(componentName);
        }
      });
    }
  });
};
