# Legacy Hugo site

The Hugo site that ran on www.followyourcode.pl until the static redesign at the repository root replaced it. Kept for reference only: nothing builds or deploys from this folder.

To look at it again, use Hugo extended 0.152.1 from the repository root:

    hugo server -s legacy
    hugo --minify -s legacy    # output in legacy/public/

The original README of the Hugo project follows.

---

# followyourcode
Engineering homepage projects for Kids.

**Quick Start**

The quickest way to get up and running is to run the following command:

`hugo server
`

The folder hugoBasicExample contains an ORIGINAL working version of a website with the
theme. It includes: the configuration file config.yaml, the content folder
content and the data folder. It's a good idea to copy this over to the
project folder to get an initial version of the website up and running.

**Structure**

Content for websites is in the data/

**Changes in theme**

To make it work, I was forced to debug it a bit and change some paths in scss bootstrap.

**Theme files**

https://gitlab.com/writeonlyhugo/up-business-theme


**Layout files**

https://www.figma.com/community/file/1022163547182520272


**Credits**

Hugo Up Business Theme is based on a Figma Design by Abell
Vo.

**License**

Up Business is licensed under the MIT license.