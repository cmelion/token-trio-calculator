// src/components/TokenSelector.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import TokenSelector from './TokenSelector';
import { StorybookAppDecorator } from '../stories/decorators/AppDecorator';
import { TokenInfo } from '@/lib/api';

// Example tokens for demo
const demoTokens: TokenInfo[] = [
    {
        id: 'usdc',
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.0,
        logoURI: '/asset/erc20/USDC.png',
        chainId: '1',
        decimals: 6,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
        id: 'eth',
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3500.0,
        logoURI: '/asset/erc20/ETH.png',
        chainId: '1',
        decimals: 18,
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    },
    {
        id: 'dai',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        price: 1.0,
        logoURI: '/asset/erc20/DAI.png',
        chainId: '1',
        decimals: 18,
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    {
        id: 'wbtc',
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin',
        price: 60000.0,
        logoURI: '/asset/erc20/WBTC.png',
        chainId: '1',
        decimals: 8,
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    },
];

const meta: Meta<typeof TokenSelector> = {
    title: 'Components/TokenSelector',
    component: TokenSelector,
    decorators: [
        (Story) => (
            <StorybookAppDecorator>
                <Story />
            </StorybookAppDecorator>
        ),
    ],
    args: {
        open: true,
        onClose: () => {},
        onSelect: () => {},
        tokens: demoTokens,
        selectedToken: null,
        isSelectingSource: false,
    },
};

export default meta;
type Story = StoryObj<typeof TokenSelector>;

export const Default: Story = {
    render: (args) => <TokenSelector {...args} />,
};

export const WithSelectedToken: Story = {
    args: {
        selectedToken: demoTokens[0],
    },
};

export const SourceTokenSelector: Story = {
    args: {
        isSelectingSource: true,
    },
};