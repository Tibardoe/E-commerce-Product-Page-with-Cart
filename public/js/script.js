async function cartNotification(event, buttonElement) {

    event.preventDefault();

    const productId = buttonElement.dataset.productId;
    const badge = document.querySelector(".notification-badge");
    let badgeCount = parseInt(badge.textContent);

    badgeCount += 1;

    badge.textContent = badgeCount;

    if (badgeCount > 0) {
        badge.style.display = "flex";
    }

    try {
        const response = await axios.post(`/add-item/${productId}`, { cartCount: badgeCount });
        if (response.data.sucess) {
            console.log("Cart updated successfully:", response.data);
        } else {
            console.error("Failed to update cart:", response.data.message);
        }
    } catch (error) {
        console.error("Error updating cart:", error);
    }
};

async function handleQuantity(element) {
    const isMinus = element.classList.contains("minus");
    const isPlus = element.classList.contains("plus");
    const numberOfItems = element.parentElement.querySelector(".act-quantity");

    let currentContent = parseInt(numberOfItems.textContent);

    if (isMinus && currentContent > 0) {
        currentContent -= 1;
    } else if (isPlus) {
        currentContent += 1;
    }

    numberOfItems.textContent = currentContent;

}