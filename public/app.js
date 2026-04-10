document.addEventListener('DOMContentLoaded', () => {
    let isSecureMode = false;

    const btnVulnerable = document.getElementById('btn-vulnerable');
    const btnSecure = document.getElementById('btn-secure');
    const loginEndpointUrl = document.getElementById('login-endpoint-url');
    const searchEndpointUrl = document.getElementById('search-endpoint-url');
    
    const loginForm = document.getElementById('login-form');
    const loginResult = document.getElementById('login-result');
    const searchForm = document.getElementById('search-form');
    const searchResult = document.getElementById('search-result');
    const logTerminal = document.getElementById('log-terminal');

    function logToTerminal(type, message, query = null) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        logTerminal.appendChild(entry);

        if (query) {
            const queryEntry = document.createElement('div');
            queryEntry.className = 'log-entry query';
            queryEntry.textContent = `↳ Executed Query: ${query}`;
            logTerminal.appendChild(queryEntry);
        }

        logTerminal.scrollTop = logTerminal.scrollHeight;
    }

    function toggleMode(secure) {
        isSecureMode = secure;
        
        if (secure) {
            document.body.classList.add('secure-mode');
            btnSecure.classList.add('active');
            btnVulnerable.classList.remove('active');
            loginEndpointUrl.textContent = '/api/secure/login';
            searchEndpointUrl.textContent = '/api/secure/products';
            logToTerminal('system', 'Switched to Secure Mode. Endpoints hardened against injection.');
        } else {
            document.body.classList.remove('secure-mode');
            btnVulnerable.classList.add('active');
            btnSecure.classList.remove('active');
            loginEndpointUrl.textContent = '/api/vulnerable/login';
            searchEndpointUrl.textContent = '/api/vulnerable/products';
            logToTerminal('system', 'Switched to Vulnerable Mode. Proceed with caution.');
        }

        // Clear previous results
        loginResult.classList.add('hidden');
        searchResult.classList.add('hidden');
    }

    btnVulnerable.addEventListener('click', () => toggleMode(false));
    btnSecure.addEventListener('click', () => toggleMode(true));

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const endpoint = isSecureMode ? '/api/secure/login' : '/api/vulnerable/login';
        logToTerminal('request', `POST ${endpoint} - Payload: { username: "${username}", password: "${password}" }`);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            loginResult.classList.remove('hidden');
            if (response.ok) {
                loginResult.textContent = JSON.stringify(data, null, 2);
                loginResult.className = 'result-box success';
                logToTerminal('success', `200 OK - ${data.message}`, data.query);
            } else {
                loginResult.textContent = JSON.stringify(data, null, 2);
                loginResult.className = 'result-box error';
                logToTerminal('error', `${response.status} Error - ${data.message || data.error}`, data.query);
            }
        } catch (error) {
            logToTerminal('error', `Fetch Error: ${error.message}`);
        }
    });

    // Handle Search
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const search = document.getElementById('search').value;
        
        const endpoint = isSecureMode ? '/api/secure/products' : '/api/vulnerable/products';
        const url = `${endpoint}?search=${encodeURIComponent(search)}`;
        
        logToTerminal('request', `GET ${url}`);

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            searchResult.classList.remove('hidden');
            if (response.ok) {
                searchResult.textContent = JSON.stringify(data.data, null, 2);
                searchResult.className = 'result-box success';
                logToTerminal('success', `200 OK - Returned ${data.data.length} records.`, data.query);
            } else {
                searchResult.textContent = JSON.stringify(data, null, 2);
                searchResult.className = 'result-box error';
                logToTerminal('error', `${response.status} Error - ${data.error}`, data.query);
            }
        } catch (error) {
            logToTerminal('error', `Fetch Error: ${error.message}`);
        }
    });
});
