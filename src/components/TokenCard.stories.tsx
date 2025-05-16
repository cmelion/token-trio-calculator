// src/components/TokenCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StorybookAppDecorator } from '../stories/decorators/AppDecorator';
import { TokenInfo } from '@/lib/api';
import TokenCard from './TokenCard';

// Example token for demonstration
const demoToken: TokenInfo = {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.0,
    logoURI: '/asset/erc20/USDC.png',
    chainId: '1',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Example USDC address
};

const meta: Meta<typeof TokenCard> = {
  title: 'Components/TokenCard',
  component: TokenCard,
  decorators: [
    (Story) => (
      <StorybookAppDecorator>
        <Story />
      </StorybookAppDecorator>
    ),
  ],
  args: {
    token: demoToken,
    value: '',
    onChange: () => {},
    onTokenSelect: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof TokenCard>;

export const Default: Story = {
  render: (args) => <TokenCard {...args} />,
};