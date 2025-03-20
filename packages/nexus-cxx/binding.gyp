{
  "targets": [
    {
      "target_name": "nexus-cxx",
      "include_dirs" : [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "sources": [
        "lib/nexuscxx.cc",
        "lib/memory.cc",
        "lib/process.cc"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }
  ],
}
