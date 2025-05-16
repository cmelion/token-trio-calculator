@storybook-running
Feature: Token Card Input and Display
  As a user of the crypto swap interface
  I want to input amounts in either USD or token values
  So that I can specify the amount I want to swap

  Background:
    Given I am viewing the TokenCard component

  Scenario: Displaying initial state
    Then I should see a field for entering the amount
    And I should see a button to select a token
    And I should see the current token price in USD
    And I should see my token balance

  Scenario: Switching input mode between USD and token
    Given the input mode is USD
    When I switch to token input mode
    Then the input field should display the equivalent token amount
    And the secondary value should show the USD equivalent

    When I switch back to USD input mode
    Then the input field should display the USD value
    And the secondary value should show the token equivalent

  Scenario: Entering a valid amount in USD
    Given the input mode is USD
    When I enter "100" in the amount field
    Then the secondary value should show the equivalent token amount

  Scenario: Entering a valid amount in token
    Given the input mode is token
    When I enter "2.5" in the amount field
    Then the secondary value should show the equivalent USD value

  Scenario: Displaying source and target token cards
    When I am viewing a "source" TokenCard
    Then I should see the text "You pay" in the header

    When I am viewing a "target" TokenCard
    Then I should see the text "You receive" in the header
