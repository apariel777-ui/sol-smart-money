const axios = require("axios");

exports.fetchTokenData = async (tokenAddress) => {
  try {
    const response = await axios.post(
      `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`,
      {
        mintAccounts: [tokenAddress]
      }
    );

    const token = response.data[0];

    return {
      name: token.onChainMetadata?.metadata?.data?.name,
      symbol: token.onChainMetadata?.metadata?.data?.symbol,
      decimals: token.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.decimals,
      supply: token.onChainAccountInfo?.accountInfo?.data?.parsed?.info?.supply
    };

  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};