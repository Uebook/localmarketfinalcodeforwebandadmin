
const API_BASE_URL = 'https://admin-panel-rho-sepia-57.vercel.app';

async function getCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

getCategories();
