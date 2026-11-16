<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ config('app.name', 'Pterodactyl') }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">

        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
        <link rel="manifest" href="/favicons/manifest.json">
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#4d5fe4">
        <link rel="shortcut icon" href="/favicons/favicon.ico">
        <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        <meta name="theme-color" content="#030614">

        @include('layouts.scripts')

        @section('scripts')
            @include('partials.fonts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
            {{-- Last, so it overrides the vendor sheets; the mtime busts browser caches on every edit. --}}
            <link rel="stylesheet" href="/themes/pterodactyl/css/cs2-tokens.css?v={{ filemtime(public_path('themes/pterodactyl/css/cs2-tokens.css')) }}">
            <link rel="stylesheet" href="/themes/pterodactyl/css/cs2-admin.css?v={{ filemtime(public_path('themes/pterodactyl/css/cs2-admin.css')) }}">

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
        @show
    </head>
    @php
        $rpNavigation = [
            'Basic Administration' => [
                ['route' => 'admin.index', 'match' => 'admin.index', 'icon' => 'fa-home', 'label' => 'Overview'],
                ['route' => 'admin.settings', 'match' => 'admin.settings', 'icon' => 'fa-wrench', 'label' => 'Settings'],
                ['route' => 'admin.api.index', 'match' => 'admin.api', 'icon' => 'fa-gamepad', 'label' => 'Application API'],
            ],
            'Management' => [
                ['route' => 'admin.databases', 'match' => 'admin.databases', 'icon' => 'fa-database', 'label' => 'Databases'],
                ['route' => 'admin.locations', 'match' => 'admin.locations', 'icon' => 'fa-globe', 'label' => 'Locations'],
                ['route' => 'admin.nodes', 'match' => 'admin.nodes', 'icon' => 'fa-sitemap', 'label' => 'Nodes'],
                ['route' => 'admin.servers', 'match' => 'admin.servers', 'icon' => 'fa-server', 'label' => 'Servers'],
                ['route' => 'admin.users', 'match' => 'admin.users', 'icon' => 'fa-users', 'label' => 'Users'],
            ],
            'Service Management' => [
                ['route' => 'admin.mounts', 'match' => 'admin.mounts', 'icon' => 'fa-magic', 'label' => 'Mounts'],
                ['route' => 'admin.nests', 'match' => 'admin.nests', 'icon' => 'fa-th-large', 'label' => 'Nests'],
            ],
        ];
        $rpRoute = (string) Route::currentRouteName();
        // The page header reuses the icon of the sidebar section the current page belongs to.
        $rpPageIcon = 'fa-cog';
        foreach ($rpNavigation as $rpItems) {
            foreach ($rpItems as $rpItem) {
                if (str_starts_with($rpRoute, $rpItem['match'])) {
                    $rpPageIcon = $rpItem['icon'];
                }
            }
        }
    @endphp
    <body class="hold-transition fixed cs2-admin">
        <div class="wrapper">
            <header class="main-header">
                <a href="#" class="cs2-nav-link" data-toggle="push-menu" role="button" aria-label="Toggle navigation">
                    <i class="fa fa-bars"></i>
                </a>
                <a href="{{ route('index') }}" class="cs2-brand" aria-label="{{ config('app.name', 'Pterodactyl') }}">
                    <span class="cs2-brand-mark" aria-hidden="true"><i class="fa fa-crosshairs"></i></span>
                    <span>{{ config('app.name', 'Pterodactyl') }}</span>
                </a>
                <nav class="cs2-nav">
                    <a href="{{ route('index') }}" class="cs2-nav-link" data-toggle="tooltip" data-placement="bottom" title="Dashboard" aria-label="Dashboard">
                        <i class="fa fa-clone"></i>
                    </a>
                    <a href="{{ route('admin.index') }}" class="cs2-nav-link active" data-toggle="tooltip" data-placement="bottom" title="Admin" aria-label="Admin">
                        <i class="fa fa-cogs"></i>
                    </a>
                    <a href="{{ route('account') }}" class="cs2-nav-link" data-toggle="tooltip" data-placement="bottom" title="Account Settings" aria-label="Account Settings">
                        <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=160" class="cs2-avatar" alt="">
                    </a>
                    <a href="{{ route('auth.logout') }}" id="logoutButton" class="cs2-nav-link cs2-logout" data-toggle="tooltip" data-placement="bottom" title="Sign Out" aria-label="Sign Out">
                        <i class="fa fa-sign-out"></i>
                    </a>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu">
                        @foreach ($rpNavigation as $rpHeading => $rpItems)
                            <li class="header">{{ $rpHeading }}</li>
                            @foreach ($rpItems as $rpItem)
                                <li class="{{ str_starts_with($rpRoute, $rpItem['match']) ? 'active' : '' }}">
                                    <a href="{{ route($rpItem['route']) }}">
                                        <i class="fa {{ $rpItem['icon'] }}"></i> <span>{{ $rpItem['label'] }}</span>
                                    </a>
                                </li>
                            @endforeach
                        @endforeach
                    </ul>
                </section>
            </aside>
            <div class="content-wrapper">
                <section class="content-header">
                    <span class="cs2-tile"><i class="fa fa-fw {{ $rpPageIcon }}"></i></span>
                    @yield('content-header')
                </section>
                <section class="content">
                    <div class="row">
                        <div class="col-xs-12">
                            @if (count($errors) > 0)
                                <div class="alert alert-danger">
                                    There was an error validating the data provided.<br><br>
                                    <ul>
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                            @foreach (Alert::getMessages() as $type => $messages)
                                @foreach ($messages as $message)
                                    <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                        {{ $message }}
                                    </div>
                                @endforeach
                            @endforeach
                        </div>
                    </div>
                    @yield('content')
                </section>
            </div>
            <footer class="main-footer">
                <span class="cs2-footer-meta">
                    <span><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i> {{ $appVersion }}</span>
                    <span><i class="fa fa-fw fa-clock-o"></i> {{ round(microtime(true) - LARAVEL_START, 3) }}s</span>
                </span>
            </footer>
        </div>
        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>

            @if(Auth::user()->root_admin)
                <script>
                    $('#logoutButton').on('click', function (event) {
                        event.preventDefault();

                        var that = this;
                        swal({
                            title: 'Do you want to log out?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d9534f',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Log out'
                        }, function () {
                             $.ajax({
                                type: 'POST',
                                url: '{{ route('auth.logout') }}',
                                data: {
                                    _token: '{{ csrf_token() }}'
                                },complete: function () {
                                    window.location.href = '{{route('auth.login')}}';
                                }
                        });
                    });
                });
                </script>
            @endif

            <script>
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                })
            </script>
        @show
    </body>
</html>
