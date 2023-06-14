<div align="center">
  <a href="https://github.com/MeroFuruya/node-env-helper">
    <img src="https://raw.githubusercontent.com/MeroFuruya/environmentality/main/images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">environmentality</h3>

  <p align="center">
    Makes you have a good time with environment variables and dotenv
    <br />
    <a href="https://github.com/MeroFuruya/node-env-helper"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://www.npmjs.com/package/environmentality">View on npm</a>
    ·
    <a href="https://github.com/MeroFuruya/node-env-helper/issues">Report Bug</a>
    ·
    <a href="https://github.com/MeroFuruya/node-env-helper/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

<!-- ABOUT THE PROJECT -->
## About The Project

This package lets you easily manage your environment variables and dotenv files. It is designed to be as simple as possible to use and to be as flexible as possible.

When an environement variable is missing, it will throw an error or use a default value.
It also can be used to convert environment variables to other types like numbers or booleans.

It may be used with [dotenv](https://www.npmjs.com/package/dotenv) and [dotenv-expand](https://www.npmjs.com/package/dotenv-expand) but can also be used without them.

### Built With

- [![Node.js][Node.js]][Node-url]
- [![typescript][typescript]][typescript-url]

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Installation

```sh
npm install environmentality
```

<!-- USAGE EXAMPLES -->
## Usage

```env
TEST_STRING=Hello World
TEST_NUMBER=42
TEST_BOOLEAN=true
TEST_ENUM=test
```

```typescript
import { Env, EnvVar } from 'environmentality'

@Env()
class Env {

  @EnvVar()
  readonly TEST_STRING?: string

  @EnvVar({ type: "number" })
  readonly TEST_NUMBER?: number

  @EnvVar({ type: "boolean", name: "TEST_BOOLEAN" })
  readonly myBool?: boolean

  @EnvVar({ type: "enum", enumValues: ["test", "lmao"] })
  readonly TEST_ENUM?: "test" | "lmao"

}

const env = new Env()

console.log(env.TEST_STRING) // Hello World

```

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/github_username/repo_name/issues) for a full list of proposed features (and known issues).

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[Node.js]: https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=Node.js&logoColor=white
[Node-url]: https://nodejs.org/en/

[typescript]: https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
