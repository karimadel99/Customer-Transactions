document.addEventListener('DOMContentLoaded', () => {
    const customersTable = document.getElementById('customersTable').getElementsByTagName('tbody')[0];
    const customerFilter = document.getElementById('customerFilter');
    const amountFilter = document.getElementById('amountFilter');
    const lineChartElement = document.getElementById('lineChart').getContext('2d');
    const barChartElement = document.getElementById('barChart').getContext('2d');

    let customersData = [];
    let transactionsData = [];
    let lineChart;
    let barChart;

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/data');
            const data = await response.json();
            customersData = data.customers;
            transactionsData = data.transactions;
            displayTable(customersData, transactionsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const displayTable = (customers, transactions) => {
        customersTable.innerHTML = '';
        transactions.forEach(transaction => {
            const customer = customers.find(cust => cust.id === transaction.customer_id);
            if (customer) {
                const row = customersTable.insertRow();
                row.insertCell(0).innerHTML = `<i class="fas fa-user user-icon"></i> ${customer.name}`;
                row.insertCell(1).innerText = transaction.date;
                row.insertCell(2).innerText = transaction.amount;
                const buttonCell = row.insertCell(3);
                const button = document.createElement('button');
                button.innerText = 'Show Chart';
                button.className = 'btn btn-primary btn-sm';
                button.addEventListener('click', () => displayCharts(customer.id));
                buttonCell.appendChild(button);
            }
        });
    };

    const filterTable = () => {
        const customerName = customerFilter.value.toLowerCase();
        const amount = amountFilter.value;

        const filteredCustomers = customersData.filter(customer => 
            customer.name.toLowerCase().includes(customerName)
        );

        const filteredTransactions = transactionsData.filter(transaction =>
            filteredCustomers.some(customer => customer.id === transaction.customer_id) &&
            (!amount || transaction.amount.toString().includes(amount))
        );

        displayTable(filteredCustomers, filteredTransactions);
    };

    const displayCharts = (customerId) => {
        const customerTransactions = transactionsData.filter(transaction => transaction.customer_id === customerId);
        const chartData = customerTransactions.reduce((acc, transaction) => {
            acc.labels.push(transaction.date);
            acc.data.push(transaction.amount);
            return acc;
        }, { labels: [], data: [] });

        if (lineChart) {
            lineChart.destroy();
        }
        if (barChart) {
            barChart.destroy();
        }

        const commonOptions = {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    adapters: {
                        date: {
                            locale: window.enUS
                        }
                    },
                    ticks: {
                        color: 'black' ,
                        
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'black' ,
                        
                    }
                }
            }
        };

        lineChart = new Chart(lineChartElement, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Transaction Amount',
                    data: chartData.data,
                    borderColor: 'rgba(9,9,121,0.8)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: commonOptions
        });

        barChart = new Chart(barChartElement, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Transaction Amount',
                    data: chartData.data,
                    backgroundColor: 'rgba(9,9,121,0.8)',
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: commonOptions
        });
    };

    customerFilter.addEventListener('input', filterTable);
    amountFilter.addEventListener('input', filterTable);

    fetchData();
});
