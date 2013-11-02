#ifdef _WIN32
int node_wmain(int, wchar_t *[]);
int wmain(int argc, wchar_t *wargv[]) {
	return node_wmain(argc, wargv);
}
#else
int node_main(int, char *[]);
int main(int argc, char *argv[]) {
	return node_main(argc, argv);
}
#endif
