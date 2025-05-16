# src/components/TokenSelector.feature
@storybook-running
Feature: Token Selector Dialog
  As a user of the crypto swap interface
  I want to search and select tokens from a list
  So that I can choose which tokens to swap

  Background:
    Given I am viewing the TokenSelector component

  Scenario: Displaying token selector dialog
    Then I should see a dialog with a list of tokens
    And I should see a search input
    And each token should show its symbol, name, and price

  Scenario: Searching for tokens
    When I enter "USD" in the token search field
    Then I should only see tokens containing "USD" in their name or symbol

    When I clear the search field
    Then I should see all available tokens

  Scenario: Displaying selected token
    When I am viewing the TokenSelector with "USDC" selected
    Then the "USDC" token should be highlighted