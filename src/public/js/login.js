$('form').on('submit', async function(event) {
    event.preventDefault(); 
    const email = $("[name=email]").val();
    const { error } = await supabaseClient.auth.signInWithOtp({ email, options: {
            emailRedirectTo: 'http://begintrust.com/'
        }
    });
    if(!error) {
        alert("Check your inbox.");
    } else {
        alert(error);
    }
});