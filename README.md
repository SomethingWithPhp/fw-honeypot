```markdown
# FW Honeypot

A rudimentary and extensible honeypot framework for managing blacklists, IP blocking, and integration with firewalls. (Beta)

---

## Features
- **IPv4 and IPv6 Support:** Seamlessly manages both IPv4 and IPv6 blacklists.
- **Modular Design:** Easily extendable with custom integrations.
- **Firewall Integration:** Blacklist endpoints (`/blacklist/v4` and `/blacklist/v6`) can be directly used by firewall plugins.
- **Configurable via JSON:** Adjust settings and integrations dynamically.

---

## Installation

### Prerequisites
- **Node.js**: Version 16 or higher.
- **npm**: Ensure npm is available in your environment.

### Steps
1. Clone the repository:
   ```bash
   git clone ssh://git@github.com:22/SomethingWithPhp/fw-honeypot.git
   cd fw-honeypot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. For development mode with auto-reload:
   ```bash
   npm run dev
   ```

---

## Configuration

The application uses a JSON configuration file (`.env.json`). Below is an example configuration:

```json
{
  "honeypot": {
    "port": 8080,
    "banDurationMs": 300000
  },
  "integrations": [
    {
      "name": "HoneypotSshServerIntegration",
      "config": {
        "port": 422,
        "banDurationMs": 10000
      }
    }
  ]
}
```

### Key Options:
- `honeypot.port`: Port for the honeypot API server.
- `honeypot.banDurationMs`: Duration in milliseconds for how long an IP stays on the blacklist.
- `integrations`: Array of integration configurations.

---

## API Endpoints

### `/blacklist/v4`
- Returns the list of blacklisted IPv4 addresses in `text/plain` format.
- Each IP is suffixed with `/32`.

### `/blacklist/v6`
- Returns the list of blacklisted IPv6 addresses in `text/plain` format.

---

## Development

### Code Structure
- `server.js`: Main entry point for starting the server.
- `IPList.js`: Manages IPv4 and IPv6 blacklists.
- `CreateHoneypot.js`: Dynamically loads and manages integrations.
- `Config.js`: Reads and parses the configuration file.

### Scripts
- `npm start`: Starts the server.
- `npm run dev`: Starts the server in development mode with `nodemon`.

---

## Contributing
Feel free to open an issue or submit a pull request! All contributions are welcome as this project is still in its beta phase.

---

## License
This project is licensed under the [MIT License](./LICENSE).

---

## Acknowledgements
- [ip-regex](https://www.npmjs.com/package/ip-regex): For IP address validation.
- [nodemon](https://www.npmjs.com/package/nodemon): For development auto-reloads.

---

## Disclaimer
This project is in **Beta**. It is a rudimentary implementation and may not cover all edge cases. Use at your own risk.
```
