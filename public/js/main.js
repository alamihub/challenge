

let loaded = 0, percent = 0, totalCreate = 0, totalUpld = 0, sse
                    async function init() {
                        fetch('/api/get-auth-url')
                        .then(response => response.json())
                        .then((url) => {
                            if(url.display){ $('#credentialsModal').modal('show') }
                            $('#AuthUrl').attr('href', url.authUrl)
                        })
                    }
                    function progressHandler(loaded, total, url) {
                        loaded = 0
                        percent = 0
                        $("#progressBar").width("").attr('aria-valuenow', 0).text(0 + " %")
                        sse = new EventSource(`${url}`)
                        sse.onmessage = function(ev) {
                            const msg = JSON.parse(ev.data)
                            console.log(msg.status)
                            if(msg.status === 200){
                                loaded += 1
                                // console.log(loaded)
                                percent = Math.round((loaded / total) * 100)
                                $("#progressBar").width(percent + "%").attr('aria-valuenow', percent).text(percent + " %")
                                if (percent === 100 ) {
                                    $('#table').hide()
                                    $('#info').empty().text('Operations Completed Succefully').addClass('text-success')
                                    $('#backend-msg').modal('show')
                                    sse.close()
                                }
                            }else if (msg.status > 200){
                                $("tr:has(td)").remove()
                                $('#info').empty().text('Errors Occured Durring Operations').addClass('text-warning')
                                $('#table > tbody').append('<tr><td>' + msg.errors[0].message + '</td><td>' + msg.errors[0].reason + '</td></tr>')
                                $('#table').show()
                                $('#backend-msg').modal('show')
                                sse.close()
                            }
                        }
                    }
                    const $select = $("#slectList")
                    let listnames = []
                    let details = []
                    function getlistinfo(){
                        fetch('/api/getlistinfo')
                        .then(response => response.json())
                        .then(info => {
                            details = info
                            info.map(x => listnames.push(x.listName))

                            var options = '<option value="selectlist" selected>'+ "Select Email List" +'</option>'
                            for (var i = 0; i < listnames.length; i++) 
                            { options += '<option value="' + listnames[i] + '">' + listnames[i] + '</option>'}
                            $("#slectList").html(options)
                        })
                    }
                    $(function () {
                            const   selectFile = document.getElementById('file-selector'),
                                    form = document.getElementById('upload'),
                                    selectJson = document.getElementById('json-selector'),
                                    jsonForm = document.getElementById('credJson'),                 
                                    codeForm = document.getElementById('auth')                 
                            let file, datalist 

                            init()
                            $('.toast').on('hidden.coreui.toast', () => $('#message p').remove())
                            getlistinfo()
                            $("#slectList").change(function() {
                                datalist = $(this).val()
                                console.log(datalist)
                                    details.map(x => {
                                        if (x.listName === datalist) {
                                            $('#cts').empty().append(`${x.Counts}`)
                                            $('#prx').empty().append(`${x.prefixe}`)
                                            $('#testEmail').empty().append(`${x.testEmail}`)
                                            $('#gsize').empty().append(`${x.gsize}`)
                                            totalCreate = x.gsize
                                            totalUpld = x.Counts + x.gsize
                                        }
                                    })
                            })
                            if (window.FileList && window.File) {
                                selectFile.addEventListener('change', event => {
                                        file = event.target.files[0]
                                        if (!(file.type === 'text/plain')){
                                            $('#message').append(`<p>Only text files accepted!!</p>`)
                                            $('.toast').toast('show')
                                        }   
                                    } 
                                )
                                selectJson.addEventListener('change', event => {
                                        file = event.target.files[0]
                                        if (!(file.type === 'application/json')){
                                            $('#message').append(`<p>Only json files accepted!!</p>`)
                                            $('.toast').toast('show')
                                        }   
                                    } 
                                )
                            }

                            form.addEventListener('submit', event =>{
                                event.preventDefault()
                                const name = file.name
                                const formData = new FormData(document.getElementById('upload'))
                                listUpload(formData)
                        
                            })
                            jsonForm.addEventListener('submit', event =>{
                                event.preventDefault()
                                const name = file.name
                                console.log(name)
                                const formData = new FormData(document.getElementById('credJson'))
                                jsonUpload(formData)
                        
                            })    
                            codeForm.addEventListener('submit', event =>{
                                event.preventDefault()
                                const code = $('#authCode').val()
                                // const formData = new FormData(document.getElementById('auth'))
                                // sendCode(formData)
                                sendCode(JSON.stringify({authcode: code}))
                                $('#authUrlModal').modal('hide')
                        
                            })    
                            async function listUpload(formData) {
                                try {
                                    let response = await fetch('/api/upload', {method: 'POST', body: formData})
                                    let msg = await response.json()
                                    console.log(msg)
                                    $('#message').append(`<p>${msg.message}</p>`)
                                    $('.toast').toast('show')
                                    return msg.message
                                } catch (error) {
                                    console.error(error)
                                }
                            }
                            async function jsonUpload(formData) {
                                try {
                                    let response = await fetch('/api/cred-json', {method: 'POST', body: formData})
                                    let msg = await response.json()
                                    console.log(msg)
                                    $('#message').append(`<p>${msg.message}</p>`)
                                    $('.toast').toast('show')
                                    $('.toast').on('hidden.coreui.toast', function () {location.reload()})
                                    
                                    // return msg.message
                                } catch (error) {
                                    console.error(error)
                                }
                            }
                            async function sendCode(formData) {
                                try {
                                    let response = await fetch('/api/send-code', {method: 'POST', body: formData, headers: {"Content-Type": "application/json"}})
                                    let msg = await response.json()
                                    console.log(msg)
                                    $('#message').append(`<p>${msg.message}</p>`)
                                    $('.toast').toast('show')
                                    // $('.toast').on('hidden.coreui.toast', function () {location.reload()})
                                    
                                    return msg.message
                                } catch (error) {
                                    console.error(error)
                                }
                            }
                            $('#createGrps').click( function(e) {
                                e.preventDefault()
                                let data = JSON.stringify({listName: datalist})
                                let options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data }
                                fetch('/api/get-groups', options)
                                progressHandler(loaded, totalCreate, '/api/ssegrps')
                            })
                            $('#upldEmails').click(function(e){
                                e.preventDefault()
                                let data = JSON.stringify({listName: datalist, gSize: totalCreate})
                                let options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data }
                                fetch('/api/get-emails', options)
                                progressHandler(loaded, totalUpld, '/api/ssembrs')
                            })
                    })