const btnPay = document.getElementById('btn-pay');

function sendRequest() {
    btnPay.disabled = true;
    btnPay.innerHTML = `
        <div class="spinner-border text-light" role="status"></div>
    `
}



var stripe = Stripe('pk_test_51HFryEHgLC7tFrSVSqYKy6iFgpLsp2vz8BWtvfaQof7mESDbcMHqUu6w00NJEfZK2iLBujdfMQL1yZkLj7J2iUdE00ejXy4lDv');
var elements = stripe.elements();

var style = {
    base: {
        fontSize: '16px', '::placeholder': { color: "#aab7c4" },
        fontFamily: '"Open Sans", "Helvetica", sans-serif',
        fontSmoothing: 'antialiased',
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};

var card = elements.create('card', { hidePostalCode: true, style: style });
card.mount('#card-element');

const customerId = document.getElementById('customerId').value;
const priceId = document.getElementById('priceId').value;

console.log(customerId);
console.log(priceId);

card.addEventListener('change', event => {
    var displayError = document.getElementById('card-errors');

    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

var form = document.getElementById('subscription-form');

form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    // If a previous payment was attempted, get the latest invoice
    const latestInvoicePaymentIntentStatus = localStorage.getItem(
        'latestInvoicePaymentIntentStatus'
    );

    if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
        const invoiceId = localStorage.getItem('latestInvoiceId');
        const isPaymentRetry = true;
        // create new payment method & retry payment on invoice with new payment method
        createPaymentMethod({
            card,
            isPaymentRetry,
            invoiceId,
        });
    } else {
        // create new payment method & create subscription
        createPaymentMethod({ card });
    }
});

 function displayError(event) {
    let displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
};

function createPaymentMethod({ card, isPaymentRetry, invoiceId }) {
    // Set up payment method for recurring usage
    let billingName = document.querySelector('#name').value;

    stripe
        .createPaymentMethod({
            type: 'card',
            card: card,
            billing_details: {
                name: billingName,
            },
        })
        .then((result) => {
            if (result.error) {
                displayError(result);
            } else {
                if (isPaymentRetry) {
                    // Update the payment method and retry invoice payment
                    retryInvoiceWithNewPaymentMethod({
                        customerId: customerId,
                        paymentMethodId: result.paymentMethod.id,
                        invoiceId: invoiceId,
                        priceId: priceId,
                    });
                } else {
                    // Create the subscription
                    createSubscription({
                        customerId: customerId,
                        paymentMethodId: result.paymentMethod.id,
                        priceId: priceId,
                    });
                }
            }
        });
}



function createSubscription({ customerId, paymentMethodId, priceId }) {
    sendRequest();
    return (
        fetch('/subscription/create', {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                customerId: customerId,
                paymentMethodId: paymentMethodId,
                priceId: priceId,
            }),
        })
            .then((response) => {
                return response.json();
            })
            .then((result) => {
                if (result.error) {
                    throw result;
                }
                return result;
            })
            .then((result) => {
                return {
                    paymentMethodId: paymentMethodId,
                    priceId: priceId,
                    subscription: result,
                };

            })

            // Some payment methods require a customer to be on session
            // to complete the payment process. Check the status of the
            // payment intent to handle these actions.
            .then(handlePaymentThatRequiresCustomerAction)
            // If attaching this card to a Customer object succeeds,
            // but attempts to charge the customer fail, you
            // get a requires_payment_method error.
            .then(handleRequiresPaymentMethod)
            // No more actions required. Provision your service for the user.
            .then(onSubscriptionComplete)

            .catch((error) => {
                // An error has happened. Display the failure to the user here.
                // We utilize the HTML element we created.
                //showCardError(error);
                displayError(error);
            })
    );
}



function onSubscriptionComplete(result) {
    console.log(result);
    onSubscriptionCompleteRedirect(result);
}

function onSubscriptionCompleteRedirect({
    priceId: priceId, 
    subscription: subscription,
    paymentMethodId: paymentMethodId
    }) {
    btnPay.innerText = ''
    btnPay.disabled = false;
    btnPay.innerHTML = `<i class="far fa-check-circle text-white" style='font-size: 30px;'></i>`
    let subscriptionId;
    let currentPeriodEnd;
    let customerId;
    if(subscription) {
        subscriptionId = subscription.id;
        currentPeriodEnd = subscription.current_period_end;
        if(typeof subscription.customer === 'object') {
            customerId = subscription.customer.id;
        } else {
            customerId = subscription.customer;
        }
    }
    setTimeout(() => {
        window.location.href =
                '/subscription/create?subscriptionId='+
                subscriptionId +
                '&priceId=' +
                priceId +
                '&currentPeriodEnd=' +
                currentPeriodEnd +
                '&customerId=' +
                customerId +
                '&paymentMethodId=' +
                paymentMethodId;
    }, 2000)
}


function handlePaymentThatRequiresCustomerAction({
    subscription,
    invoice,
    priceId,
    paymentMethodId,
    isRetry,
}) {
    if (subscription && subscription.status === 'active') {
        // Subscription is active, no customer actions required.
        return { subscription, priceId, paymentMethodId };
    }

    // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
    // If it's a retry, the payment intent will be on the invoice itself.
    let paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent;

    if (
        paymentIntent.status === 'requires_action' ||
        (isRetry === true && paymentIntent.status === 'requires_payment_method')
    ) {
        return stripe
            .confirmCardPayment(paymentIntent.client_secret, {
                payment_method: paymentMethodId,
            })
            .then((result) => {
                if (result.error) {
                    // Start code flow to handle updating the payment details.
                    // Display error message in your UI.
                    // The card was declined (i.e. insufficient funds, card has expired, etc).
                    throw result;
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        // Show a success message to your customer.
                        // There's a risk of the customer closing the window before the callback.
                        // We recommend setting up webhook endpoints later in this guide.
                        return {
                            priceId: priceId,
                            subscription: subscription,
                            invoice: invoice,
                            paymentMethodId: paymentMethodId,
                        };
                    }
                }
            })
            .catch((error) => {
                displayError(error);
            });
    } else {
        // No customer action needed.
        return { subscription, priceId, paymentMethodId };
    }
}




function handleRequiresPaymentMethod({
    subscription,
    paymentMethodId,
    priceId,
}) {
    if (subscription.status === 'active') {
        // subscription is active, no customer actions required.
        return { subscription, priceId, paymentMethodId };
    } else if (
        subscription.latest_invoice.payment_intent.status ===
        'requires_payment_method'
    ) {
        // Using localStorage to manage the state of the retry here,
        // feel free to replace with what you prefer.
        // Store the latest invoice ID and status.
        localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
        localStorage.setItem(
            'latestInvoicePaymentIntentStatus',
            subscription.latest_invoice.payment_intent.status
        );
        throw { error: { message: 'Your card was declined.' } };
    } else {
        return { subscription, priceId, paymentMethodId };
    }
}



function retryInvoiceWithNewPaymentMethod({
    customerId,
    paymentMethodId,
    invoiceId,
    priceId
}) {
    return (
        fetch('/subscription/retry-invoice', {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                customerId: customerId,
                paymentMethodId: paymentMethodId,
                invoiceId: invoiceId,
            }),
        })
            .then((response) => {
                return response.json();
            })
            // If the card is declined, display an error to the user.
            .then((result) => {
                if (result.error) {
                    // The card had an error when trying to attach it to a customer.
                    throw result;
                }
                return result;
            })
            // Normalize the result to contain the object returned by Stripe.
            // Add the additional details we need.
            .then((result) => {
                return {
                    // Use the Stripe 'object' property on the
                    // returned result to understand what object is returned.
                    invoice: result,
                    paymentMethodId: paymentMethodId,
                    priceId: priceId,
                    isRetry: true,
                };
            })
            // Some payment methods require a customer to be on session
            // to complete the payment process. Check the status of the
            // payment intent to handle these actions.
            .then(handlePaymentThatRequiresCustomerAction)
            // No more actions required. Provision your service for the user.
            .then(onSubscriptionComplete)
            .catch((error) => {
                // An error has happened. Display the failure to the user here.
                // We utilize the HTML element we created.
                displayError(error);
            })
    );
}





function cancelSubscription() {
    return fetch('/cancel-subscription', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subscriptionId: subscriptionId,
        }),
    })
        .then(response => {
            return response.json();
        })
        .then(cancelSubscriptionResponse => {
            // Display to the user that the subscription has been cancelled.
        });
}



function retrieveCustomerPaymentMethod(paymentMethodId) {
    return fetch('/retrieve-customer-payment-method', {
        method: 'post',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            paymentMethodId: paymentMethodId,
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            return response;
        });
}