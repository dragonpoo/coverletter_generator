//Init datas
const ITEM_PER_PAGE = 10;
// supabaseClient.auth.getSession().then(({ data: { session } }) => {
    // if(!session) {
        // location.href = "/login.html";
        // return;
    // }
    // window.session = session;
    window.session = {
        user: 'techninjas514@gmail.com'
    }
    $(".profile.email").text(session.user.email);
    
    //Start Socket
    var socket = io('/');

    // When we receive a "chat message" event, add the message to the list
    socket.on('log', function(msg){
        if($("#loglist").children().length>1000) {
            $("#loglist").find(">div").last().remove();
        }
        $("#loglist").prepend(`<div>${msg}</div>`);
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');

        let timeString = `${hours}:${minutes}:${seconds} `;
        if(msg.includes("ACCOUNT CREATER: "))
            $("#creator-status").text(timeString + msg.replace("ACCOUNT CREATER: ", "")).removeClass('error');
        else
            $("#jobseeker-status").text(timeString + msg.replace("JOB SEEKER: ", "")).removeClass('error');
    });
    socket.on('error', function(msg){
        if($("#loglist").children().length>1000) {
            $("#loglist").find(">div").last().remove();
        }
        $("#loglist").prepend(`<div style="color: red;">${msg}</div>`);
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');

        let timeString = `${hours}:${minutes}:${seconds} `;
        if(msg.includes("ACCOUNT CREATER: "))
            $("#creator-status").text(timeString + msg.replace("ACCOUNT CREATER: ", "")).addClass('error');
        else
            $("#jobseeker-status").text(timeString + msg.replace("JOB SEEKER: ", "")).addClass('error');
    });

    //Set Cookie
    let date = new Date();
    date.setTime(date.getTime() + (7*24*60*60*1000)); // This sets the cookie expiry to be 7 days from the current time.
    let expires = "expires=" + date.toUTCString();

    document.cookie = `email=techninjas514@gmail.com; ${expires}; path=/`;
    
    $('body').css('display', 'flex');
	
	BID_MODULE();

    window.reloadSettings = async function() {
        $(".loader").removeClass('hidden');
        $.ajax({
            url: `/setting`,
            type: "GET",
            success: function(data) {
                $(".loader").addClass('hidden');
                const setting = data[0];
                if(!setting) return;
                $('[name=email-server-url]').val(setting.value.EmailServiceSetting.serverUrl);
                $('[name=email-username]').val(setting.value.EmailServiceSetting.username);
                $('[name=email-password]').val(setting.value.EmailServiceSetting.password);
                $('[name=prompt-cletter]').val(setting.value.prompt_letter);
                $('[name=job-url]').val(setting.value.joburl);
                $('[name=english-level]').val(setting.value.english_level);
                $('[name=additional-receive-emails]').val(setting.value?.NotificationSetting?.additional_receive_emails);
                $('[name=headless-email]').prop('checked', setting.value?.headless_email);
                $('[name=headless-creater]').prop('checked', setting.value?.headless_creater);
                $('[name=headless-bidder]').prop('checked', setting.value?.headless_bidder);
                $('[name=headless-jobseeker]').prop('checked', setting.value?.headless_jobseeker);
            }
        });
    }
    window.saveSettings = async function() {
        $(".loader").removeClass('hidden');
        const prompt = $('[name=prompt-cletter]').val();
        const joburl = $('[name=job-url]').val();
        const emailServerUrl = $('[name=email-server-url]').val();
        const emailUsername = $('[name=email-username]').val();
        const emailPassword = $('[name=email-password]').val();
        const english_level = parseInt($('[name=english-level]').val() || '4');
        const additional_receive_emails = $('[name=additional-receive-emails]').val();
        const headless_email = $('[name=headless-email]').is(':checked');
        const headless_creater = $('[name=headless-creater]').is(':checked');
        const headless_bidder = $('[name=headless-bidder]').is(':checked');
        const headless_jobseeker = $('[name=headless-jobseeker]').is(':checked');
        $.ajax({
            url: `/setting`,
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                value: {
                    prompt_letter: prompt, 
                    joburl: joburl,
                    english_level: english_level,
                    EmailServiceSetting: {
                        serverUrl: emailServerUrl,
                        username: emailUsername,
                        password: emailPassword,
                    },
                    NotificationSetting: {
                        additional_receive_emails: additional_receive_emails,
                    },
                    headless_email,
                    headless_creater,
                    headless_bidder,
                    headless_jobseeker
                }
            }),
            success: function(data) {
                $(".loader").addClass('hidden');
                messagebox("Saved successfully");
            }
        });
    }
    window.filterEmails = function(keyword) {
        window.candidatesData.keyword = keyword;
        window.candidatesData.render();
    }

    window.filterRoles = function(keyword) {
        window.rolesData.keyword = keyword;
        window.rolesData.render();
    }

    window.filterAccounts = function(keyword) {
        reloadAccounts(0, keyword)
    }
    
    window.downloadAccountCSV = function() {
        function escapeCsvValue(value) {
            const stringValue = String(value); // convert value to String
            const needsEscape = /[,"\n\s]/.test(stringValue);
            if (needsEscape) {
              // Enclose in double quotes, replace inner double quotes with two double quotes
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue; // return unmodified value if no special characters present
        }
        const filtered = filterAccounts(window.accountsData.data, window.accountsData.keyword);
        const csvData = "Email,Password\r\n" + filtered.map(function(acc) {
            let row = `${escapeCsvValue(acc.email)},${escapeCsvValue(acc.json.password)}`;
            return row;
        }).join('\r\n');
        // Create a blob from string
        let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
        // Create link element to enable download
        let link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            let url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "accounts.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    window.viewAccount = function(id) {
        const account = window.accountsData.data.find(account => account.id == id);
        alert(JSON.stringify(account));
    }
    window.suspendAccount = async function(id) {
        $(".loader").removeClass('hidden');
        $.ajax({
            url: `/account/suspend/${id}`,
            type: "POST",
            success: function(data) {
                window.reloadAccounts(window.accountsData?.page, window.accountsData?.keyword);
            }
        });
    }
    window.emptyAccount = async function(id) {
        $(".loader").removeClass('hidden');
        $.ajax({
            url: `/account/empty/${id}`,
            type: "POST",
            success: function(data) {
                window.reloadAccounts(window.accountsData?.page, window.accountsData?.keyword);
            }
        });
    }
    window.reloadAccounts = function(page = 0, keyword = '') {
        $("#accounts tbody").attr('data-loading', 'true');
        $(".loader").removeClass('hidden');
        $.ajax({
            url: `/account?start=${page * ITEM_PER_PAGE}&end=${(page + 1) * ITEM_PER_PAGE - 1}&keyword=${keyword}&messagedonly=${!!window.account_gotmessagedonly}`,
            type: "GET",
            success: function(data) {
                $("#accounts tbody").attr('data-count', data.count).attr('data-loading', 'false');
                $(".loader").addClass('hidden');
                window.accountsData = {
                    data: data.data,
                    count: data.count,
                    page: page,
                    keyword: keyword,
                    render: () => {
                        let idx = 0;
                        $("#accounts tbody tr[data-type=item]").remove();
                        $("#accounts>h4").text(`Total ${data.count} item(s)`);
                        for(let item of window.accountsData.data) {
                            idx ++;
                            $("#accounts tbody").append(`<tr data-type="item">
                                <td>${page * ITEM_PER_PAGE + idx}</td>
                                <td>${item.json.firstname} ${item.json.lastname}</td>
                                <td onclick="copyToClipboard('${item.email}')">${item.email}</td>
                                <td onclick="copyToClipboard('${item.json.password}')">********</td>
                                <td>${item.json.role}</td>
                                <td>${item.json.country}</td>
                                <td><div onclick="newImageWindow('${item.lastmessage}')" status="${item.status}">${item.status}</div></td>
                                <td><div>${moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')}</div><hr><div>${item.suspended_at?moment(item.suspended_at).format('YYYY-MM-DD HH:mm:ss'):''}</div></td>
                                <td>
                                    <button class="${item.running?'':'hidden'}" onclick="getScreenshot('account', '${item.email}')">📺</button>
                                    <button onclick="viewAccount(${item.id})">📝</button>
                                    <button onclick="suspendAccount(${item.id})">Suspend</button>
                                    <button onclick="emptyAccount(${item.id})">Con Out</button>
                                </td>
                            </tr>`);
                        }
                        window.renderPagination();
                    }
                };
                window.accountsData.render();
            },
            error: function(error) {
                console.error('Error:', error);
                $("#accounts tbody").attr('data-loading', 'false');
                $(".loader").addClass('hidden');
            }
        });
    }

    window.filterBids = function(keyword) {
        reloadBids(window.bidsData.page, keyword);
    }

    window.reloadDashboard = async function() {
        $(".loader").removeClass('hidden');
        let response = await fetch('/os/stats');
        let stats = await response.json();

        const lastm = localStorage.getItem("messaged");
        const style = lastm==stats.messaged?'':'color: red;';
        localStorage.setItem("messaged", stats.messaged);
        $(".cpu").text(`${parseInt(stats.cpuUsage*100)}`);
        $(".mem").text(`${100 - parseInt(stats.freeMem*100)}`);
        $(".bid").html(`<span style="${style}">${stats.messaged}</span>/${stats.bidcount}`);
        $(".account").text(`${stats.candicount}/${stats.accountcount}`);
        $(".project").text(`${stats.projectcount}`);
        $(".loader").addClass('hidden');
    }

    window.onKeyPress = function() {
        if(event.target.id != 'myChart' || !window.statvalues) return;
        switch(event.key) {
            case 'a':
                window.tableoff++;
                drawChart();
                break;
            case 'd':
                window.tableoff--;
                drawChart();
                break;
            default:
                break;
        }
    }

    window.tableoff = 0;
    window.drawStatGraph = async function() {
        window.tableoff = 0;
        $(".loader").removeClass('hidden');
        const tbl = $("#stat-param-table").val().split('#')[0];
        const columns = $("#stat-param-table").val().split('#')[1].split(',');
        const delta = $("#stat-param-delta").val();
        
        window.statvalues = {};
        for(const column of columns) {
            let responsedb = await fetch(`/os/dbstats/${tbl}/${delta}/${column}`);
            let dbstats = await responsedb.json();
            window.statvalues[column] = dbstats;
        }
        drawChart();
        $(".loader").addClass('hidden');
    }

    window.drawChart = function() {
        const tbl = $("#stat-param-table").val().split('#')[0];
        const columns = $("#stat-param-table").val().split('#')[1].split(',');
        const delta = $("#stat-param-delta").val();
        const deltalbl = {'10': 'day', '13': 'hour', '16': 'minute'};
        let xValues = [];
        let yValues = [];
        const colortbl = ["red", "green","blue","orange","brown"];
        for(let i=9; i>=0; i--) {
            const d = moment().subtract(i + window.tableoff, deltalbl[delta]);
            xValues.push(d.format('YYYY-MM-DDTHH:mm:ss').substring(0, delta));
        }

        for(const column of columns) {
            const newd = {label: `${tbl} -> ${column}`, data: [], borderColor: colortbl.shift()};
            xValues.map(k => {
                newd.data.push(window.statvalues[column][k] || 0);
            });
            yValues.push(newd);
        }
        //Timezone Convert
        if(delta == '16') xValues = xValues.map(t => moment(t).utcOffset(-420).format("MMM D, HH:mm"));
        if(delta == '13') xValues = xValues.map(t => moment(t).utcOffset(-420).format("MMM D, HH:00"));
        if(delta == '10') xValues = xValues.map(t => moment(t).utcOffset(-420).format("MMM D"));

        $("#myChart").html('');
        if(window.statChart) window.statChart.destroy();
        window.statChart = new Chart("myChart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: yValues
            },
            options: {
                animation: {
                    duration: 0 // set animation duration to 0 to disable it
                },
                title: {
                    display: true,
                    text: `Statistics of ${moment().utcOffset(-420).format("MMM D HH:mm")}\nA, D key to slide`
                },
                scales: {
                  yAxes: [{
                    ticks: {
                      min: 0  // Replace with your minimum value.
                    }
                  }]
                }
            }
        });
    }

    $("#gotmessagedonly").change(function() {
        window.account_gotmessagedonly = $(this).is(':checked');
        window.reloadAccounts(0, window.accountsData.keyword);
    })
    window.reloadTrends = async function(page = 0) {
        if(!window.trendsData) {
            $(".loader").removeClass('hidden');
            $.ajax({
                url: "/job",
                type: "GET",
                success: function(jobs) {
                    //Skill Chart
                    let skillstat = {};
                    for(const job of jobs) {
                        const arr = job.skills.split(',');
                        for(const item of arr) {
                            if(!skillstat[item]) skillstat[item] = 1;
                            else skillstat[item] ++;
                        }
                    }
                    $(".loader").addClass('hidden');
            
                    let darr = Object.keys(skillstat).map(skill => ({key: skill, value: skillstat[skill]}));
                    darr = darr.sort((a,b)=>b.value-a.value)

                    ////////////////////////////////
                    $("#roles tbody").attr('data-count', jobs.length).attr('data-loading', 'false');
                    window.trendsData = {
                        data: darr,
                        count: darr.length,
                        page: page,
                        keyword: '',
                        render: () => {
                            $("#trends .skill").html(window.trendsData.data.slice(window.trendsData.page * ITEM_PER_PAGE, window.trendsData.page * ITEM_PER_PAGE + ITEM_PER_PAGE).map((i, idx)=>`<div style="font-size: 2em;">${idx+1 + ITEM_PER_PAGE * window.trendsData.page}. ${i.key}: ${i.value}<b></b></div>`))
                            renderPagination();
                        }
                    };
                    window.trendsData.render();
                },
                error: function(error) {
                    console.error('Error:', error);
                    $("#roles tbody").attr('data-loading', 'false');
                    $(".loader").addClass('hidden');
                }
            });
        } else {
            window.trendsData.page = page;
            window.trendsData.render(page);
        }
    }
    window.reloadBids = async function(page = 0, keyword = '') {
        $("#bids tbody").attr('data-loading', 'true');
        $(".loader").removeClass('hidden');
        $.ajax({
            url: `/bid?start=${page * ITEM_PER_PAGE}&end=${(page + 1) * ITEM_PER_PAGE - 1}&keyword=${keyword}`,
            type: "GET",
            success: function(data) {
                // data.data.sort((a,b) => a.email.gotmessaged?-1:1);
                for(const bid of data.data) {
                    bid.jobobj.skills = bid.jobobj.skills.split(",");
                }
                $("#bids tbody").attr('data-count', data.count).attr('data-loading', 'false');
                $(".loader").addClass('hidden');
                window.bidsData = {
                    data: data.data,
                    count: data.count,
                    page: page,
                    keyword: '',
                    render: () => {
                        let idx = 0;
                        $("#bids tbody tr[data-type=item]").remove();
                        $("#bids>h4").text(`Total ${data.count} item(s)`);
                        for(let item of window.bidsData.data) {
                            idx ++;
                            const skills = item.jobobj.skills.map(skill => `<tag>${skill}</tag>`).join('');
                            $("#bids tbody").append(`<tr data-type="item">
                                <td>${idx + ITEM_PER_PAGE * page}</td>
                                <td><div class="email-wrapper${item.emailobj.status == "3. Action Required"?' line-through':''}" onclick="copyToClipboard('${item.emailobj.email}')">${item.emailobj.email}</div><hr><div onclick="copyToClipboard('${item.emailobj.password}')">********</div></td>
                                <td><div class="ellipsed-text"><b>${item.jobobj.title}</b><br><div style="text-align: left">${item.jobobj.description}</div></div><div style="padding-top: 0.5em;">${skills}</div></td>
                                <td style="text-align: left; white-space: pre-line;"><b>${item.emailobj.json.role}</b>${item.boosted?'<tag>&gt;&gt;&gt;</tag>':''}
                                    <div class="ellipsed-text">${item.letter}<br><br><b>Questions:</b><br><br>${(item.answers || []).map((i, idx)=>`<b>${idx + 1} ${i.q}</b><br>${i.a}`).join('<br><br>')}</div>
                                </td>
                                <td><div style="white-space: nowrap;">${moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')}</div><hr><div>${item.emailobj.gotmessaged?'Got Messaged':''}</div></td>
                            </tr>`);
                        }
                        $("#bids .ellipsed-text").click(function() {
                            $(this).addClass('open');
                        })
                        renderPagination();
                    }
                };
                window.bidsData.render();
            }
        })
    }
    window.generateCandidates = function() {
        const email = $(".email-generator input").val();
        $(".loader").removeClass('hidden');
        $.ajax({
            url: "/candidate/generate/" + email,
            type: "GET",
            success: function(data) {
                $("#roles tbody").attr('data-count', data.length).attr('data-loading', 'false');
                $("[data-target=candidates]").click();
                window.reloadCandidates();
            },
            error: function(error) {
                console.error('Error:', error);
                $("#roles tbody").attr('data-loading', 'false');
                $(".loader").addClass('hidden');
            }
        });
    }
    window.generateEstimate = function() {
        const email = $(".email-generator input").val();
        const [local] = email.split('@');
        $(".email-generator button").eq(0).text(`Generate(${Math.pow(2, local.length - 1)})`);
    }
    window.removeCandidates = async function() {
        const email = $(".email-generator input").val();
        $(".loader").removeClass('hidden');
        $.ajax({
            url: "/candidate/clear",
            type: "POST",
            success: function(data) {
                window.reloadCandidates();
            }
        });
    }
    window.newImageWindow = function(image) {
        let imageWindow = window.open("", "_blank");
        imageWindow.document.write('<img src="data:image/png;base64,' + image + '" />');
    }
    window.enableRole = async function(id, el) {
        $(".loader").removeClass('hidden');
        $.ajax({
            url: `/role/enable/${id}/${$(el).is(':checked')}`,
            type: "POST",
            success: function(data) {
                $(".loader").addClass('hidden');
            }
        });
    }
    window.enableFile = async function(id, el) {
        $(".loader").removeClass('hidden');
        $.ajax({
            url: `/file/enable/${id}/${$(el).is(':checked')}`,
            type: "POST",
            success: function(data) {
                $(".loader").addClass('hidden');
            }
        });
    }
    window.editRole = function(id) {
        let role = window.rolesData.data.find(role => role.id == id);
        if(!role) return;
        role = {...role};
        delete role.account;
        delete role.account_created;
        delete role.account_live;
        delete role.account_messaged;
        role.skills = role.skills.join(',');
        $("#role-modal").removeClass('hidden');
        $("#role-modal form *").remove();
        Object.keys(role).map(key => {
            const val = role[key];
            const type = typeof(val);
            let inputtype = 'text';
            if(type == 'boolean') inputtype = 'checkbox';
            if(key == 'id' || key == 'owner_email' || key == 'created_at') inputtype = 'hidden';
            if(key == 'summary' || key == 'pastwork' || key == 'skills') inputtype = 'textarea';
            if(key == 'experience') inputtype = 'object';
            if(inputtype == 'hidden') $("#role-modal form").append(`<input type="${inputtype}" value="${val}">`);
            if(inputtype == 'text') $("#role-modal form").append(`<div class="col-50"><label for="role_field_${key}">${key}(${type})</label><input type="${inputtype}" value="${val}"></div>`);
            if(inputtype == 'textarea') $("#role-modal form").append(`<div class="vertical"><label for="role_field_${key}">${key}(${type})</label><textarea rows="10" cols="80">${val}</textarea></div>`);
            if(inputtype == 'checkbox') $("#role-modal form").append(`<div class="col-50"><label for="role_field_${key}">${key}(${type})</label><input type="${inputtype}" ${val?'checked':''}></div>`);
            if(key == 'experience') {
                let exphtmltotal = '<div><label>experiences</label>';
                let idx = 0;
                for(const exp of val) {
                    idx ++;
                    let exphtml = `<div class="horizontal"><label>${idx}.</label><div>`;
                    Object.keys(exp).map(ekey => {
                        const expval = exp[ekey];
                        if(ekey == 'description') exphtml += `<div class="vertical"><label for="role_field_${ekey}">${ekey}</label><textarea rows="10" cols="80">${expval}</textarea></div>`;
                        else exphtml += `<div class="col-50"><label for="role_field_${ekey}">${ekey}</label><input type="text" value="${expval}"></div>`;
                    });
                    exphtml += '</div></div>'
                    exphtmltotal += exphtml;
                }
                exphtmltotal += '</div>';
                $("#role-modal form").append(exphtmltotal);
            }
        });
    }
    window.hideRoleModal = function() {
        $("#role-modal").addClass('hidden');
    }
    window.reloadRoles = function() {
        $("#roles tbody").attr('data-loading', 'true');
        $(".loader").removeClass('hidden');
        $.ajax({
            url: "/role",
            type: "GET",
            success: function(data) {
                $("#roles tbody").attr('data-count', data.length).attr('data-loading', 'false');
                $(".loader").addClass('hidden');
                window.rolesData = {
                    data: data.reverse(),
                    start: 0,
                    end: 15,
                    keyword: '',
                    render: () => {
                        let idx = 0;
                        let filtered = window.rolesData.data.filter(i=>i.title.toLowerCase().includes(window.rolesData.keyword.toLowerCase()));
                        $("#roles tbody tr[data-type=item]").remove();
                        filtered = filtered.sort((b,a) => a.account_messaged == b.account_messaged?a.account_created - b.account_created:a.account_messaged - b.account_messaged);
                        $("#roles>h4").text(`Total ${filtered.length} item(s)`);
                        for(let item of filtered) {
                            idx ++;
                            $("#roles tbody").append(`<tr data-type="item">
                                <td>${idx}</td>
                                <td>${item.title}</td>
                                <td>${item.hourlyrate}</td>
                                <td>${item.skills.map(a => `<tag>${a}</tag>`).join('')}</td>
                                <td><div>${item.account_live}/${item.account_created}</div><hr><div>${item.account_messaged}</div></td>
                                <td><input type="checkbox" ${item.enabled?'checked':''} onclick="enableRole(${item.id}, this)" />
                                <button onclick="editRole(${item.id})">📝</button>
                                </td>
                            </tr>`);
                        }
                    }
                };
                window.rolesData.render();
            },
            error: function(error) {
                console.error('Error:', error);
                $("#roles tbody").attr('data-loading', 'false');
                $(".loader").addClass('hidden');
            }
        });
    }
    window.reloadFiles = function() {
        $("#files tbody").attr('data-loading', 'true');
        $(".loader").removeClass('hidden');
        $.ajax({
            url: "/file",
            type: "GET",
            success: function(data) {
                let idx = 0;
                $("#files tbody").attr('data-count', data.length).attr('data-loading', 'false');
                $(".loader").addClass('hidden');
                $("#files>h4").text(`Total ${data.length} item(s)`);
                data.sort((a, b) => a.account_messaged == b.account_messaged?a.account_created - b.account_created:a.account_messaged - b.account_messaged);
                window.filesData = {
                    data: data.reverse(),
                    start: 0,
                    end: 15,
                    render: () => {
                        $("#files tbody tr[data-type=item]").remove();
                        for(let item of window.filesData.data) {
                            idx ++;
                            $("#files tbody").append(`<tr data-type="item">
                                <td>${idx}</td>
                                <td><img src="/uploads/avatar/${item.filename}" /></td>
                                <td>${item.account_created}</td>
                                <td>${item.account_messaged}</td>
                                <td><input type="checkbox" ${item.enabled?'checked':''} onclick="enableFile(${item.id}, this)" /></td>
                                <td><button onclick="deleteFile(${item.id})">Delete</button></td>
                            </tr>`);
                        }
                    }
                };
                window.filesData.render();
            },
            error: function(error) {
                console.error('Error:', error);
                $("#files tbody").attr('data-loading', 'false');
                $(".loader").addClass('hidden');
            }
        });
    }
    window.deleteFile = function(id) {
        $.ajax({
            url: "/file/" + id,
            type: "DELETE",
            success: function(data) {
                let idx = window.filesData.data.findIndex(file => file.id == id);
                if(idx>=0) window.filesData.data.splice(idx, 1);
                $("#files>h4").text(`Total ${window.filesData.data.length} item(s)`);
                window.filesData.render();
            },
            error: function(error) {
                console.error('Error:', error);
            }
        });
    }
    window.reloadCandidates = function() {
        $("#candidates tbody").attr('data-loading', 'true');
        $(".loader").removeClass('hidden');
        $.ajax({
            url: "/candidate",
            type: "GET",
            success: function(data) {
                $("#candidates tbody").attr('data-count', data.count).attr('data-loading', 'false');
                $(".loader").addClass('hidden');
                window.candidatesData = {
                    data: data.candidates,
                    start: 0,
                    end: 15,
                    keyword: '',
                    render: () => {
                        const filtered = window.candidatesData.data.filter(i=>i.email.toLowerCase().includes(window.candidatesData.keyword.toLowerCase()));
                        $("#candidates tbody tr[data-type=item]").remove();
                        $("#candidates>h4").text(`Total ${data.count} item(s)`);
                        let idx = 0;
                        for(let item of filtered.splice(window.candidatesData.start, window.candidatesData.end)) {
                            idx ++;
                            $("#candidates tbody").append(`<tr data-type="item">
                                <td>${idx}</td>
                                <td>${item.email}</td>
                                <td><input type="checkbox" ${item.exclude?'checked':''}/></td>
                                <td></td>
                            </tr>`);
                        }
                    }
                };
                window.candidatesData.render();
            },
            error: function(error) {
                console.error('Error:', error);
                $("#candidates tbody").attr('data-loading', 'false');
                $(".loader").addClass('hidden');
            }
        });
    }

    //Events
    $('ul>[data-target]').click(function() {
        const target = $(this).data('target');
        location.href = `#${target}`;
        $(`#${target}`).parent().find('>*').hide();
        $(`#${target}`).show();
        $(`#${target} input.search-input`).val('');
        //
        $('[data-target]').removeClass('active');
        $(this).addClass('active');
        const funcname = `reload${target[0].toUpperCase() + target.slice(1)}`;
        window[funcname] && window[funcname]();
    });
    const urlhash = window.location.hash.substring(1) || 'gpt';
    $(`[data-target=${urlhash}]`).click();
    $('.logout').click(async function() {
        // let { error } = await supabaseClient.auth.signOut();
        location.reload();
    })

    window.messagebox = function(text) {
        $(".alert").text(text).show();
        setTimeout(() => {
            $(".alert").fadeOut("slow", function() {
                $(this).hide();
            })
        }, 2000)
    }

    window.revealPassword = function(el, pwd) {
        const hiddenPwd = "********";
        if($(el).text() == hiddenPwd) $(el).text(pwd);
        setTimeout(() => {
            $(el).text(hiddenPwd);
        }, 5000);
    }

    window.getScreenshot = function(type = 'email', email = '', timeout = 1000) {
        let streaming_handle;
        let width = 50;
        $(".screen-viewer").removeClass("hidden");
        $(".screen-viewer").off('click').on('click', function() {
            $(".screen-viewer").addClass("hidden");
            clearInterval(streaming_handle);
        });
        $("button[dim]").removeClass("active");
        $("button[dim=50]").addClass("active");
        $(".screen-viewer button[dim]").off('click').on('click', function() {
            width = $(this).attr('dim');
            $("button[dim]").removeClass("active");
            $(this).addClass("active");
            event.stopPropagation();
        });
        $('.screen-viewer .popup').off('click').on('click', function() {
            let popupWindow = window.open("", "Upwork", "width=1000,height=1000");
            popupWindow.document.write(`<img class="screen" />
            <style>
                body { padding: 0; }
                img { width: 100%; height: 100%; }
            </style>
            <script>
                const refresh = async () => {
                    const url = "/screenshot/${type}/${email}/${width}/${width}";
                    let response = await fetch(url);
                    const imageBlob = await response.blob();
                    const imageObjectURL = URL.createObjectURL(imageBlob);
                    document.querySelector("img").src = imageObjectURL;
                };
                refresh();
                setInterval(refresh, ${timeout});
            </script>`);
            //stop
            $(".screen-viewer").addClass("hidden");
            clearInterval(streaming_handle);
        });
        let img = $('.screen-viewer img');
        let fetching = false;
        async function preview() {
            const url = `/screenshot/${type}/${email}/${width}/${width}`;
            if(fetching) return;
            fetching = true;
            let response = await fetch(url);
            fetching = false;
            const imageBlob = await response.blob();
            const imageObjectURL = URL.createObjectURL(imageBlob);
            img[0].src = imageObjectURL;
        }
        preview();

        streaming_handle = setInterval(() => {
            preview();
        }, timeout);
    }

    window.startServiceEmail = async function() {
        await fetch('/service/email/start');
        $(".service-email").addClass("status-running");
        $(".service-email").parent().next().find('button').eq(2).removeClass("hidden");
    }
    window.stopServiceEmail = async function() {
        await fetch('/service/email/stop');
        $(".service-email").removeClass("status-running");
        $(".service-email").parent().next().find('button').eq(2).addClass("hidden");
    }
    window.startServiceCreator = async function() {
        await fetch('/service/creator/start');
        $(".service-creator").addClass("status-running");
        $(".service-creator").parent().next().next().find('button').eq(2).removeClass("hidden");
    }
    window.stopServiceCreator = async function() {
        await fetch('/service/creator/stop');
        $(".service-creator").removeClass("status-running");
        $(".service-creator").parent().next().next().find('button').eq(2).addClass("hidden");
    }
    window.startServiceBidder = async function() {
        await fetch('/service/bidder/start');
        $(".service-bidder").addClass("status-running");
        $(".service-bidder").parent().next().next().find('button').eq(2).removeClass("hidden");
    }
    window.stopServiceBidder = async function() {
        await fetch('/service/bidder/stop');
        $(".service-bidder").removeClass("status-running");
        $(".service-bidder").parent().next().next().find('button').eq(2).addClass("hidden");
    }
    fetch('/service/bidder/check').then(stream => stream.json()).then(ret => {
        ret.enabled && $(".service-bidder").addClass("status-running");
        ret.enabled && $(".service-bidder").parent().next().next().find('button').eq(2).removeClass("hidden");
    });
    fetch('/service/creator/check').then(stream => stream.json()).then(ret => {
        ret.enabled && $(".service-creator").addClass("status-running");
        ret.enabled && $(".service-creator").parent().next().next().find('button').eq(2).removeClass("hidden");
    });
    fetch('/service/email/check').then(stream => stream.json()).then(ret => {
        ret.enabled && $(".service-email").addClass("status-running");
        ret.enabled && $(".service-email").parent().next().find('button').eq(2).removeClass("hidden");
    });

    $('#files form').on('submit', function(event) {
        event.preventDefault(); 
        var formData = new FormData(this); // 'this' refers to the form element
    
        $.ajax({
            url: '/file', // the endpoint where the form should be submitted
            type: 'POST',
            data: formData,
            processData: false, // important
            contentType: false, // important
            success: function(response) {
                reloadFiles();
            },
            error: function(err) {
                console.error(err);
            }
        });
    }); 

    //Pagination
    window.renderPagination = function () {
        $("pagination").each(function() {
            const $target = $(this).data('target');
            let data = window[$target+'Data'];
            let funcname = "reload" + $target.substring(0, 1).toUpperCase() + $target.substring(1);
            if(!data) return;
            !Array.isArray(data.data) && (data = {count: 0, page: 0});
            let start = Math.max(data.page || 0 - 2, 0);
            const pages = Math.ceil((data.count || 0) / ITEM_PER_PAGE);
            const pagebtns = [...Array(Math.min(pages - start, 5)).keys()].map(idx => idx + start).map(idx => `<button class="${data.page == idx?'active':''}" onclick="${funcname}(${idx}, window['${$target}'].keyword)">${idx+1}</button>`).join('')
            const $el = `<page-navs>
                <button class="first">&lt;&lt;</button>
                <button class="prev">&lt;</button>
                ${pagebtns}
                <button class="next">&gt;</button>
                <button class="last">&gt;&gt;</button>
            </page-navs>`;
            $(this).html($el);
            $(this).css("text-align", 'center');
            $(this).css("display", 'block');
            $(this).find(".first").on('click', function() {
                window[funcname](0, data.keyword);
            });
            $(this).find(".prev").on('click', function() {
                window[funcname](Math.max(data.page - 1, 0), data.keyword);
            });
            $(this).find(".next").on('click', function() {
                window[funcname](Math.min(data.page + 1, pages - 1), data.keyword);
            });
            $(this).find(".last").on('click', function() {
                window[funcname](pages - 1, data.keyword);
            });
        });
    }
    window.measureStart = function() {
        const type = $("#measure_type").val();
        $("#measure_result").text("Starting...")
        $.ajax({
            url: `/admin/measure/start/${type}`,
            type: "GET",
            success: function(data) {
                $("#measure_result").text("Started!")
            },
            error: function(error) {
            }
        });
    }
    window.measureStop = function() {
        const type = $("#measure_type").val();
        $("#measure_result").text("Finishing...")
        $.ajax({
            url: `/admin/measure/end/${type}`,
            type: "GET",
            success: function(data) {
                $("#measure_result").text("Finished!")
            },
            error: function(error) {
            }
        });
    }
    window.getMeasure = function() {
        const type = $("#measure_type").val();
        $("#measure_result").text("Retrieving...")
        $.ajax({
            url: `/admin/store`,
            type: "GET",
            success: function(data) {
                $("#measure_result").text(JSON.stringify(data, null, 6));
            },
            error: function(error) {
            }
        });
    }
    
    fetch('/tools/models', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {                
            }
        )
    })
    .then(response => response.json())
    .then(data => {
        $(".loader").addClass('hidden');
        data.data.sort((a,b) => a.id.localeCompare(b.id));
        for(const model of data.data) {
            $("#gptModel").append(`<option value="${model.id}">${model.id}</option>`)
        }
		$("#gptModel").val(localStorage.getItem("gpt_model") || 'gpt-3.5-turbo');
    })
// });