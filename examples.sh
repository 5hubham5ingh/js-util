set -x

JS=("${1:-js}")

$JS "' Welcome to js demo and examples '.style(['bg-grey','#ffffff']).border('double').stack('Starting in...'.border(),'center').align('center').log()"
$JS "render.timer(Date.now() + 5..seconds)"

# Enquire functions for interactive prompts
$JS "enquire.ask('What is your name?').log()"
$JS "enquire.confirm('Do you like js?').log()"
$JS "enquire.secret('Enter a secret').log()"
$JS "enquire.choose(['Option A', 'Option B', 'Option C']).log()"
$JS "enquire.select(['Item 1', 'Item 2', 'Item 3', 'Item 4']).log()"
$JS "enquire.search(['Apple', 'Banana', 'Orange', 'Grape', 'Pineapple', 'Strawberry']).log()"
$JS "enquire.pick().log()"                                                                       # Interactive file/directory picker
$JS "enquire.describe().log()"                                                                   # Multi-line text input
$JS "enquire.color().stringify(null,2).log()"                                                    # Color picker
$JS "const contentToEdit = 'Initial content for the editor.'; enquire.edit(contentToEdit).log()" # Open content in external editor

# Render functions for UI elements
$JS "render.pages(read('examples.sh'))"                                                                         # Paginated display of a file
$JS "stop = render.loader(); os.sleep(3000); stop()"                                                            # Generic loader
$JS "stop = render.loader('Processing data...'); os.sleep(3000); stop()"                                        # Loader with custom message
$JS "render.levels([[10, 20, 'Progress A', false], [5, 15, 'Progress B', true], [7, 10, 'Progress C', false]])" # Animated level bars
$JS "render.heatMap([[0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4, 5, 6, 7]])"

# Draw functions for text-based graphics
$JS "draw.table([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob', age: 30 }]).log()"
$JS "({ a: 1, b: 2, c: 3 }).table().log()" # Object as table
$JS "const t1 = ({ x: 10, y: 20 }).table(); const t2 = [{ fruit: 'apple' }, { fruit: 'banana' }].table(); t1.join(t2).log()"
$JS "const b1 = 'Hello'.border('double'); const b2 = 'World'.border('rounded'); b1.stack(b2, 'center').log()"
$JS "draw.levels([[15,30,'Task 1',false],[10,20,'Task 2',true],[5,10,'Task 3',false]]).log()"

# Global utility functions
$JS "print('Current working directory:', cwd)"
$JS "print('List files in current directory:', ls.map(f => f.toString()).join(', '))"
$JS "cd('/tmp'); print('Changed directory to:', cwd); cd(HOME)" # Change directory
$JS "ensureDir('/tmp/test_dir'); print('Created /tmp/test_dir')"
$JS "stat('/tmp/test_dir').log()" # Get file/directory stats
$JS "'echo Hello from exec'.exec().log()"
$JS "'echo Hello from execAsync'.execAsync().then(r => print(r.stdout)).catch(e => print(e))"
$JS "read('examples.sh').lines().slice(0, 5).join('\\n').log()" # Read file, manipulate lines

# Prototype extensions
$JS "'{\"key\":\"value\"}'.parseJson().log()"
$JS "({key:'value'}).stringify().log()"
$JS "'This is a test string'.style(['bold', 'red', 'bg-yellow']).log()"
$JS "'This has some \x1b[34mcolor\x1b[0m'.stripStyle().log()"
$JS "'Hello 👋 World 🌍'.stripEmojis().log()"
$JS "'A long line of text that needs to be wrapped due to its excessive length and will be wrapped by words to fit the terminal width'.wrap(30).log()"
$JS "'OneTwoThreeFourFiveSix'.chunks(5).log()"
$JS "'key=value\\nanother=thing'.parseIni().log()"
$JS "'[table]\\nkey = \"value\"'.parseToml().log()"
$JS "'header1,header2\\nvalue1,value2'.toCsvJson().log()"
$JS "({a:1, b:2}).toIni().log()"
$JS "({table:{key:'value'}}).toToml().log()"
$JS "[1,2,3].remove(2).log()"
$JS "[1,1,2,3].removeAll(1).log()"
$JS "[{id:1,name:'Alice'},{id:2,name:'Bob'}].toCsvText().log()"

# Logging
$JS "log.error('This is an error.', 'This is error details')"
$JS "log.warn('This is a warning.')"
$JS "log.info('This is an info.')"
$JS "log.fatal('This is a fatal error.')"
