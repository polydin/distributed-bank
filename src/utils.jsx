async function postTxToAccount(account, body) {
    return fetch(`http://localhost:5000/api/users/${account}/txs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body,
        }).then(response => response.json());
}

export { postTxToAccount }