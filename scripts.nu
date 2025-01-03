
# I must add main for each function I create
def "main refine-publishable-package-json-files" [] {

print "Looking through package.json files to change"
print ".ts to .js and removing /src"

 glob dist/packages/* 
 | each { |value| 
            open $"($value)/package.json" --raw 
            | collect 
            | str replace "\\.ts" ".js" --regex --all  
            | str replace "\\./src" "." --regex --all  
            | save $"($value)/package.json" -f
    }
 | ignore 

 print "Changed files"
}

def main [] {}