{ pkgs }: {
  deps = [
    pkgs.python312Packages.open-interpreter
    pkgs.nodejs
    pkgs.libuuid
    pkgs.zlib
    pkgs.freetype
    pkgs.fontconfig
    pkgs.cairo
  ];
}