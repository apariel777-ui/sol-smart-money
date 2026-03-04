const axios = require("axios");

const TOKEN_DECIMALS = 6;

exports.fetchTokenTransactions = async (tokenAddress) => {
  try {
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) throw new Error("Missing HELIUS_API_KEY");

    // Get real decimals for this token
    const mintInfoRes = await axios.post(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [tokenAddress, { encoding: "jsonParsed" }]
      }
    );

    const decimals =
      mintInfoRes.data?.result?.value?.data?.parsed?.info?.decimals ?? TOKEN_DECIMALS;

    // Get top holders
    const holdersRes = await axios.post(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        jsonrpc: "2.0",
        id: 2,
        method: "getTokenAccounts",
        params: {
          mint: tokenAddress,
          limit: 100,
          options: { showZeroBalance: false }
        }
      }
    );

    const holders = holdersRes.data?.result?.token_accounts || [];
    if (holders.length === 0) return [];

    const divisor = Math.pow(10, decimals);

    return holders
      .map(h => ({
        wallet: h.owner,
        netAmount: parseFloat((Number(h.amount) / divisor).toFixed(2)),
        totalBuys: parseFloat((Number(h.amount) / divisor).toFixed(2)),
        totalSells: 0,
        holdingScore: 1,
        minutesAfterLaunch: null,
        firstBuyTimestamp: null
      }))
      .filter(w => w.netAmount > 0)
      .sort((a, b) => b.netAmount - a.netAmount)
      .slice(0, 10);

  } catch (error) {
    console.error("TX ERROR:", error.response?.data || error.message);
    return [];
  }
};