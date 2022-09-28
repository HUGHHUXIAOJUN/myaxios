function loadXhr(urls,limit,confirmHandler,errorHandler,handler){
  let arr = [...urls],promiseArr = [],index = 0;

  function load(arr){
    let url = arr.shift();
    if(!url)return
    return Promise.resolve(url).then(res=>{
      confirmHandler(res) 
    })
    .catch((err)=>{
      errorHandler(err)
    })
    .then((res)=>{
      index++
      if(index == urls.length){
        handler(res)
      }
      return load(arr)
    })

  }
  while(limit--){
    promiseArr.push(load(arr))
  }
  return Promise.all(promiseArr)
}

function confirmHandler(res){
  console.log(`我成功了${res}`)
}
function errorHandler(res){
  console.log(`我失败了${res}`)
}
function handler(res){
  console.log(`我结束了${res}`)
}
//limitLoad([1,2,3,4,5,6,7],()=>Promise.resolve(1),3)
function limitLoad (urls, handler, limit) {
  const sequence = [].concat(urls) // 对数组做一个拷贝
  let count = 0
  const promises = []

  const load = function () {
    if (sequence.length <= 0) return 
    count += 1
    return handler(sequence.shift())
      .catch(err => {
        count--
        console.error(err)
      })
      .then(() => {
        count--
      })
      .then(() => load())
  }

  for(let i = 0; i < limit && i < sequence.length; i++){
    promises.push(load())
  }
  return Promise.all(promises)
}


function thortle(fn,context,daily,content){
  clearTimeout(fn.timerId)
  fn.timerId =  setTimeout(()=>{
    fn.call(context,content)
  },daily)
}