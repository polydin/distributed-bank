export async function getUser(address) {
    const user = await fetch(`http://localhost:5000/api/users/${address}`).then(response => response.json());
    return user;
}

export async function getTransactions(address) {
    const user = await getUser(address);
    return user.transactions;
}