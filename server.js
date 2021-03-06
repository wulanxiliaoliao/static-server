var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]
if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) {
        queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
    }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/

    console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
    console.log(path)
    if (path === "/register" && method === "POST") {
        response.setHeader('Content-Type', 'text/html;charse=utf-8')
        let usersArray = JSON.parse(fs.readFileSync('./db/users.json'))
        const array = []
        request.on('data', (chunk) => {
            array.push(chunk)
        })
        request.on('end', () => {
            let string = Buffer.concat(array).toString() //返回一个新缓冲区，该缓冲区是将列表中的所有缓冲区实例连接在一起的结果。
            const obj = JSON.parse(string)
            console.log(obj.name)
            console.log(obj.password)
            const lastUser = usersArray[usersArray.length - 1]
            const newUser = {
                id: lastUser ? lastUser.id + 1 : 1,
                name: obj.name,
                password: obj.password
            }
            usersArray.push(newUser)
            fs.writeFileSync('./db/users.json', JSON.stringify(usersArray))
            response.end("很好")
        })
    } else {
        response.statusCode = 200
        // 默认首页
        response.setHeader('Content-Type',
            'text/html;charset=utf-8')
        const filePath = path === '/' ? '/index.html' : path
        const index = filePath.lastIndexOf('.')
        const suffix = filePath.substring(index)
        const fileTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg'
        }
        response.setHeader('Content-Type', `${fileTypes[suffix] || 'text/html'};charset=utf-8`)
        let content
        try {
            content = fs.readFileSync(`./public${filePath}`)
        } catch (error) {
            content = '文件不存在'
            response.statusCode = 404
        }
        response.write(content)
        response.end()
    }


    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)