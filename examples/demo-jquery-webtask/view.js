const ejs = require('ejs');

const template = `
  <html>
    <head>
      <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
      <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.5/flatly/bootstrap.min.css">
    </head>
    <body style="margin-bottom: 50px;">
      <div class="jumbotron">
        <div class="container text-center">
          <h1>Auth0 - Box Platform Demo</h1>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-sm-12 col-md-9">
            <h2>Authorization</h2>
              <p>Press <strong>Login</strong> to authenticate with an Auth0 user and request access to the Box Platform.</p>
              <div>
                <button id="login" class="btn btn-primary" style="margin-right: 10px;">Login</button>
              </div>
          </div>
          <div class="col-sm-12 col-md-9" style="margin-top: 10px;">
            <pre class="hidden" id="error-contents"></pre>
          </div>
        </div>
        <div id="token-details" class="row hidden">
          <div class="col-sm-12 col-md-9">
            <h2>Token</h2>
            <p>Here is the <strong>id_token</strong> issued by Auth0.</p>
            <pre id="id-token"></pre>
            <p>And these are the contents of the <strong>id_token</strong>.</p>
            <pre id="id-token-contents"></pre>
            <p>Here is the <strong>access_token</strong> issued by Auth0.</p>
            <pre id="access-token"></pre>

            <h2>Box</h2>
            <p>
              More information about the Box Platform API can be found <a href="https://developer.box.com/reference#api-docs-directory">here</a>.
            </p>
            <button id="get-token" class="btn btn-success" style="margin-right: 10px;">Get Box Token</button>
            <button id="call-box" class="btn btn-warning" style="margin-right: 10px;">Call Box (/2.0/users/me)</button>
            <pre id="api-response" class="hidden" style="margin-top: 10px;"></pre>
          </div>
        </div>
      </div>
      <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.js"></script>
      <script src="//cdn.auth0.com/js/auth0/8.3.0/auth0.min.js"></script>
      <script type="text/javascript">
        var auth0 = new auth0.WebAuth({
          domain: '<%= AUTH0_DOMAIN %>',
          clientID: '<%= AUTH0_CLIENT_ID %>'
        });

        auth0.parseHash(function(err, data) {
          if (err) {
            $('#error-contents').removeClass('hidden');
            $('#error-contents').text(JSON.stringify(err, null, 2));
            return;
          }

          if (data) {
            $('#token-details').removeClass('hidden');
            $('#access-token').text(data.accessToken);
            $('#id-token').text(data.idToken);
            $('#id-token-contents').text(JSON.stringify(data.idTokenPayload, null, 2));

            window.location.hash = '';
          }
        });

        $(function () {
          $('#login').click(function(e) {
            e.preventDefault();

            auth0.authorize({
              audience: 'urn:box-platform-api',
              scope: 'openid name email get:token',
              responseType: 'token id_token',
              redirectUri: window.location.href
            });
          })

          var boxAccessToken = null;

          $('#get-token').click(function(e) {
            e.preventDefault();

            $.ajax({
                cache: false,
                url: "<%= BOX_DELEGATION_ENDPOINT %>",
                headers: { "Authorization": "Bearer " + $('#access-token').text() }
            })
            .done(function(data) {
              boxAccessToken = data.access_token;
              $('#api-response').text(JSON.stringify(data, null, 2));
            })
            .fail(function(xhr) {
              $('#api-response').text(JSON.stringify(xhr.responseJSON, null, 2));
            })
            .always(function() {
              $('#api-response').removeClass('hidden');
            });
          });

          $('#call-box').click(function(e) {
            e.preventDefault();

            $.ajax({
                cache: false,
                url: "https://api.box.com/2.0/users/me",
                headers: { "Authorization": "Bearer " + boxAccessToken }
            })
            .done(function(data) {
              console.log(data);
              $('#api-response').text(JSON.stringify(data, null, 2));
            })
            .fail(function(xhr) {
              console.log(data);
              $('#api-response').text(JSON.stringify(xhr.responseJSON, null, 2));
            })
            .always(function() {
              $('#api-response').removeClass('hidden');
            });
          });
        });
      </script>
    </body>
  </html>`;

module.exports = (req, res) => {
  res.send(ejs.render(template, {
    AUTH0_DOMAIN: req.webtaskContext.secrets.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: req.webtaskContext.secrets.AUTH0_CLIENT_ID,
    BOX_DELEGATION_ENDPOINT: req.webtaskContext.secrets.BOX_DELEGATION_ENDPOINT
  }));
};
