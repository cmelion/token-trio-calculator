@storybook-running @component
Feature: Token Swap Application
  As a user
  I want to compare token values and explore potential swaps
  So that I can make informed decisions about token exchanges

  Background:
    Given I am viewing the application

  Scenario: Viewing the initial application state
    Then I should see the site header
    And I should see the home page content
    Then I should see the text "You pay" in the header
    Then I should see the text "You receive" in the header
    And I should see the exchange rate between tokens

  Scenario: Quick selecting tokens using token buttons
    When I click the "ETH" quick select button
    Then the source token should be "ETH"

    When I click the "USDC" quick select button
    Then the source token should be "USDC"

    When I click on a token that is already selected as target
    Then the source and target tokens should be swapped

  Scenario: Opening and closing the token selector dialog
    When I click the token select button on the source card
    Then I should see the token selector dialog

    When I click on the "WBTC" token
    Then the token selector dialog should close
    And the source token should be "WBTC"

    When I click the token select button on the target card
    Then I should see the token selector dialog

    When I click on the "ETH" token
    Then the token selector dialog should close
    And the target token should be "ETH"

  Scenario: Entering amounts and seeing conversions
    When I enter "100" in the source amount field
    Then the target amount should be updated

    When I switch the source card to token input mode
    Then the source input field should display the equivalent token amount
    And the source secondary value should show the USD equivalent

    When I enter "2.5" in the source amount field
    Then the target amount should be updated
    And the exchange rate should reflect the correct conversion

  Scenario: Seeing real-time exchange rates
    Given I click the "ETH" quick select button
    Then the source token is "ETH"
    And the target token is "USDC"
    And I should see the exchange rate between "ETH" and "USDC"

  Scenario: Connecting a wallet and viewing token balances
    When I click the "Connect Wallet" button
    Then I should see the wallet connection dialog
    When I select the "Coinbase Wallet" wallet provider
    Then the wallet should be connected
    And I should see the wallet name "Coinbase" in the header
    And I should see the token balances displayed on the token cards
    When I enter "1000" in the source amount field
    Then I should see a balance warning if the amount exceeds my balance
