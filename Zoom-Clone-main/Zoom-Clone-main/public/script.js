//access video and audio 
const socket = io('/');

//getUserMedia is a promise set true whatever u want to get - resolved or rejected 
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});


let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    //myVideoStream will recive a stream
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })


    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })

    let msg = $('input');
    // console.log(msg)

    $('html').keydown((e) => {
        if (e.which == 13 && msg.val().length !== 0) {
            // console.log(msg.val());
            socket.emit('message', msg.val());
            msg.val('');
        }
    })

    socket.on('createMessage', message => {
        // console.log("SERVER : ", message);
        $('.messages').append(`<li class="message"><b>User : </b>${message}</li>`);
        scrollToBottom();
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})
socket.emit('join-room', ROOM_ID);


const connectToNewUser = (userId, stream) => {
    // console.log(userId);
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

//muted
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteBotton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteBotton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}
const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}
const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}