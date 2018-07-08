# git-identity

[![npm version](https://badge.fury.io/js/git-identity.svg)](https://badge.fury.io/js/git-identity)

Have you ever had trouble managing git identities? or are you to lazy to switch between work and private identities?

`git-identity` aims to solve this problem by providing a simple and convenient way to switch between profiles.

#### Installation

`npm install -g git-identity`

## Usage

```
   USAGE

     git-identity <command> [options]

   COMMANDS

     use <identity>         use an identity                                           
     add <name>             add the current identity to .gitidentities                
     remove <identity>      remove an identity from .gitidentities                    
     show <identity>        show info about an identity                               
     ls                     list all identities                                       
     reset                  reset identity for this project to the global git identity
     current                show current identity                                     
     help <command>         Display help for a specific command                       

   GLOBAL OPTIONS

     -h, --help         Display help                                      
     -V, --version      Display version                                   
     --no-color         Disable colors                                    
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages    

```

##### Examples

`git identity use work` - use your work profile for your current project.

`git identity use -g private` - use your private profile globally

`git identity add newProfileName` - adds the current profile to the profile list.

#### Shell autocompletion note

git-identity uses [caporal](https://github.com/mattallty/Caporal.js) and therefore benefits from auto completion for bash, zsh and fish, this however needs some [manual setup](https://github.com/mattallty/Caporal.js?#shell-auto-completion).
