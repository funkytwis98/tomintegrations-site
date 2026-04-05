(function(){
  var SB_URL="https://wdebkubmcvapgrexypeq.supabase.co";
  var SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJrdWJtY3ZhcGdyZXh5cGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzMyNTgsImV4cCI6MjA4ODAwOTI1OH0.7y32FrUqg9fWj_05UKtiPK9Uh7QNIG4e2_-RU1eD670";

  function getVisitorId(){
    var m=document.cookie.match(/(?:^|; )_tv=([^;]*)/);
    if(m)return m[1];
    var id=crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==="x"?r:r&3|8).toString(16)});
    document.cookie="_tv="+id+";path=/;max-age=31536000;SameSite=Lax";
    return id;
  }

  function track(){
    fetch(SB_URL+"/rest/v1/site_page_views",{
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Prefer":"return=minimal"},
      body:JSON.stringify({
        page:location.pathname,
        referrer:document.referrer||null,
        user_agent:navigator.userAgent,
        screen_width:window.innerWidth,
        visitor_id:getVisitorId()
      }),
      keepalive:true
    }).catch(function(){});
  }

  if(document.readyState==="complete")track();
  else window.addEventListener("load",track);
})();
