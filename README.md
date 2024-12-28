# Proof of Collaboration Protocol

## Overview
The Proof of Collaboration Protocol is a decentralized system built on the Stacks blockchain that verifies and rewards collaborative contributions in a trustless manner. This smart contract implementation enables transparent tracking of contributions, automatic tier progression, and decentralized governance for collaborative projects.

## Table of Contents
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Contract Functions](#contract-functions)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality
- **Contribution Tracking**: Submit, verify, and score project contributions
- **Tiered Recognition System**: Automatic progression through Bronze, Silver, Gold, and Platinum tiers
- **Decentralized Governance**: Multi-admin system for contribution verification
- **Transparent Scoring**: On-chain tracking of contribution scores and history

### Tier Thresholds
- Bronze: Starting tier (0-99 points)
- Silver: 100+ points
- Gold: 250+ points
- Platinum: 500+ points

## Technical Architecture

### Data Structures
```clarity
Contributors Map:
- total-score: uint
- contribution-count: uint
- tier: uint
- is-active: bool

Contributions Map:
- contributor: principal
- timestamp: uint
- details: string-utf8
- score: uint
- verified: bool
```

### Role System
- Contract Owner: Full administrative privileges
- Project Admins: Can verify and score contributions
- Contributors: Can submit contributions and earn tier upgrades

## Installation

### Prerequisites
- Stacks CLI installed
- Clarity VS Code extension (recommended)
- Stacks wallet for deployment

### Setup Steps
1. Clone the repository:
```bash
git clone https://github.com/DorisIbe/Decentralised-Proof-Of-Collaboration.git
cd dec_proof_of_collab
```

2. Install dependencies:
```bash
npm install @stacks/cli
```

3. Deploy the contract:
```bash
stacks deploy --network testnet proof-of-collab.clar
```

## Usage

### For Project Administrators

1. Initialize the contract after deployment:
```clarity
(contract-call? .proof-of-collaboration initialize)
```

2. Add additional project admins:
```clarity
(contract-call? .proof-of-collaboration add-project-admin 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7)
```

3. Verify contributions:
```clarity
(contract-call? .proof-of-collaboration verify-contribution u1 u50)
```

### For Contributors

1. Submit a contribution:
```clarity
(contract-call? .proof-of-collaboration submit-contribution "Implemented new feature XYZ")
```

2. Check your profile:
```clarity
(contract-call? .proof-of-collaboration get-contributor-profile tx-sender)
```

## Contract Functions

### Public Functions
- `submit-contribution`: Submit new project contributions
- `verify-contribution`: Verify and score contributions (admin only)
- `update-contributor-tier`: Update contributor's tier based on total score

### Read-Only Functions
- `get-contribution`: Retrieve contribution details
- `get-contributor-profile`: Get contributor's complete profile
- `get-contributor-tier`: Check contributor's current tier
- `is-project-admin`: Verify if an address has admin privileges

## Testing

1. Run the test suite:
```bash
clarinet test
```

2. Test coverage includes:
- Contribution submission
- Admin verification
- Tier progression
- Access control
- Edge cases

## Security Considerations

### Access Control
- Only verified project admins can validate contributions
- Strict owner-only functions for critical operations
- Role-based permission system

### Data Validation
- Input validation for all public functions
- Score boundaries enforcement
- Duplicate submission prevention

### Best Practices
- Use `asserts!` for permission checks
- Implement proper error handling
- Follow Clarity best practices for map operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Contribution Guidelines
- Follow Clarity coding standards
- Add tests for new features
- Update documentation
- Use descriptive commit messages

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Additional Resources
- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language Reference](https://docs.stacks.co/references/language-overview)
- [Clarity Testing Framework](https://docs.stacks.co/clarity/testing)

## Support
For support and questions:
- Open an issue in the repository