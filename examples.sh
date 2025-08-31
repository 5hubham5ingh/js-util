set -x

# Enquire functions for interactive prompts
js "enquire.ask('What is your name?').log()"
js "enquire.confirm('Do you like js?').log()"
js "enquire.secret('Enter a secret').log()"
js "enquire.choose(['Option A', 'Option B', 'Option C']).log()"
js "enquire.select(['Item 1', 'Item 2', 'Item 3', 'Item 4']).log()"
js "enquire.search(['Apple', 'Banana', 'Orange', 'Grape', 'Pineapple', 'Strawberry']).log()"
js "enquire.pick().log()"                                                                       # Interactive file/directory picker
js "enquire.describe().log()"                                                                   # Multi-line text input
js "enquire.color().stringify(null,2).log()"                                                    # Color picker
js "const contentToEdit = 'Initial content for the editor.'; enquire.edit(contentToEdit).log()" # Open content in external editor

# Render functions for UI elements
js "render.pages(read('examples.sh'))"                                                                         # Paginated display of a file
js "stop = render.loader(); os.sleep(3000); stop()"                                                            # Generic loader
js "stop = render.loader('Processing data...'); os.sleep(3000); stop()"                                        # Loader with custom message
js "render.levels([[10, 20, 'Progress A', false], [5, 15, 'Progress B', true], [7, 10, 'Progress C', false]])" # Animated level bars

# Draw functions for text-based graphics
js "draw.table([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob', age: 30 }]).log()"
js "({ a: 1, b: 2, c: 3 }).table().log()" # Object as table
js "const t1 = ({ x: 10, y: 20 }).table(); const t2 = [{ fruit: 'apple' }, { fruit: 'banana' }].table(); t1.join(t2).log()"
js "const b1 = 'Hello'.border('double'); const b2 = 'World'.border('rounded'); b1.stack(b2, 'center').log()"
js "draw.levels([[15,30,'Task 1',false],[10,20,'Task 2',true],[5,10,'Task 3',false]]).log()"

# Global utility functions
js "print('Current working directory:', cwd)"
js "print('List files in current directory:', ls.map(f => f.toString()).join(', '))"
js "cd('/tmp'); print('Changed directory to:', cwd); cd(HOME)" # Change directory
js "ensureDir('/tmp/test_dir'); print('Created /tmp/test_dir')"
js "stat('/tmp/test_dir').log()" # Get file/directory stats
js "'echo Hello from exec'.exec().log()"
js "'echo Hello from execAsync'.execAsync().then(r => print(r.stdout)).catch(e => print(e))"
js "parse('{\"key\":\"value\"}').log()"
js "stringify({ key: 'value' }).log()"
js "read('examples.sh').lines().slice(0, 5).join('\\n').log()" # Read file, manipulate lines

# Prototype extensions
js "'This is a test string'.style(['bold', 'red', 'bg-yellow']).log()"
js "'This has some \x1b[34mcolor\x1b[0m'.stripStyle().log()"
js "'Hello 👋 World 🌍'.stripEmojis().log()"
js "'A long line of text that needs to be wrapped due to its excessive length and will be wrapped by words to fit the terminal width'.wrap(30).log()"
js "'OneTwoThreeFourFiveSix'.chunks(5).log()"
js "'key=value\\nanother=thing'.parseIni().log()"
js "'[table]\\nkey = \"value\"'.parseToml().log()"
js "'header1,header2\\nvalue1,value2'.toCsvJson().log()"
js "({a:1, b:2}).toIni().log()"
js "({table:{key:'value'}}).toToml().log()"
js "[1,2,3].remove(2).log()"
js "[1,1,2,3].removeAll(1).log()"
js "[{id:1,name:'Alice'},{id:2,name:'Bob'}].toCsvText().log()"
