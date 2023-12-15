// BBB : https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd
// Dolby Digital Plus EC-3: https://dash.akamaized.net/dash264/TestCasesMCA/dolby/3/1/ChID_voices_20_128_ddp.mpd
// ref: https://reference.dashif.org/dash.js/nightly/samples/dash-if-reference-player/index.html

//var baseUrl = "https://dash.akamaized.net/akamai/bbb_30fps/";
//var initUrl = baseUrl + "bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_0.m4v";
//var initAudioUrl = baseUrl + "bbb_a64k/bbb_a64k_0.m4a";
var baseUrl = "https://dash.akamaized.net/dash264/TestCasesMCA/dolby/3/1/";
var initUrl = baseUrl + "ChID_voices_20_128_ddp_V.mp4";
var initAudioUrl = baseUrl + "ChID_voices_20_128_ddp_A.mp4";

//var templateUrl =
//  baseUrl + "bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_$Number$.m4v";
//var templateUrlForAudio = baseUrl + "bbb_a64k/bbb_a64k_$Number$.m4a";
var templateUrl =
  baseUrl + "ChID_voices_20_128_ddp_V.mp4";
var templateUrlForAudio = baseUrl + "ChID_voices_20_128_ddp_A.mp4";

var sourceBuffer;
var audioSourceBuffer;
var index = 0;
var audioIndex = 0;
//var numberOfChunks = 159;
var numberOfChunks = 1;
var video = document.querySelector("video");
var ms = new MediaSource();

function onPageLoad() {
  console.log("page loaded ..");
  if (!window.MediaSource) {
    console.error("No Media Source API available");
    return;
  }
  // making source controlled by JS using MS
  video.src = window.URL.createObjectURL(ms);
  ms.addEventListener("sourceopen", onMediaSourceOpen);
}

function onMediaSourceOpen() {
  try {
  // create source buffer
  //sourceBuffer = ms.addSourceBuffer('video/mp4; codecs="avc1.4d401f"');
  sourceBuffer = ms.addSourceBuffer('video/mp4; codecs="avc1.42801e"');
  // when ever one segment is loaded go for next
  sourceBuffer.addEventListener("updateend", nextSegment);
    // fire init segemnts
  GET(initUrl, appendToBuffer);
  console.log("Video buffer successfully created.");
  }
  catch (errV) {
    console.log("Error creating video buffer.");
    console.error(errV);
  }
  
  //audioSourceBuffer = ms.addSourceBuffer('audio/mp4; codecs="mp4a.40.5"');
  try {
    // create source buffer
    audioSourceBuffer = ms.addSourceBuffer('audio/mp4; codecs="ec-3"');
    // when ever one segment is loaded go for next
    audioSourceBuffer.addEventListener("updateend", nextAudioSegment);
    // fire init segemnts
    GET(initAudioUrl, appendToAudioBuffer);
    console.log("Audio buffer successfully created.");
  }
  catch (errA) {
    console.log("Error creating audio buffer.");
    console.error(errA);
  }

  // play
  video.muted = true;
  video.play();
}

// get next segment based on index and append, once everything loaded unlisten to the event
function nextSegment() {
  var url = templateUrl.replace("$Number$", index);
  GET(url, appendToBuffer);
  index++;
  if (index > numberOfChunks) {
    sourceBuffer.removeEventListener("updateend", nextSegment);
  }
}

// get next audio segment based on index and append, once everything loaded unlisten to the event
function nextAudioSegment() {
  try {
    var audioUrl = templateUrlForAudio.replace("$Number$", audioIndex);
    GET(audioUrl, appendToAudioBuffer);
    audioIndex++;
    if (index > numberOfChunks) {
      audioSourceBuffer.removeEventListener("updateend", nextAudioSegment);
    }
  catch {
    console.log("Error getting next audio segment.");
    console.error(errA);
  }
}

// add to existing source
function appendToBuffer(videoChunk) {
  if (videoChunk) {
    sourceBuffer.appendBuffer(new Uint8Array(videoChunk));
  }
}

function appendToAudioBuffer(audioChunk) {
  try {
    if (audioChunk) {
      audioSourceBuffer.appendBuffer(new Uint8Array(audioChunk));
    }
  }
  catch {
    console.log("Error appending chuck.");
    console.error(errA);
  }
}

// just network thing
function GET(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer";

  xhr.onload = function (e) {
    if (xhr.status != 200) {
      console.warn("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    callback(xhr.response);
  };

  xhr.send();
}

document.onload = onPageLoad();
