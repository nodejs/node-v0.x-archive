# Copyright (C) 2009 The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

ifndef NODE_PREFIX
	NODE_PREFIX := $(LOCAL_PATH)
endif

include $(CLEAR_VARS)

intermediates := $(LOCAL_PATH)/out/$(APP_OPTIM)

include $(LOCAL_PATH)/Android.jsnatives.mk
$(LOCAL_PATH)/src/node_javascript.cc : $(jsnatives)

LOCAL_MODULE := node

LOCAL_CPP_EXTENSION := .cc

LOCAL_C_INCLUDES += \
	$(intermediates)/src \
	$(LOCAL_PATH)/src
	
LOCAL_SRC_FILES := \
	src/cares_wrap.cc \
	src/fs_event_wrap.cc \
	src/handle_wrap.cc \
	src/node.cc \
	src/node_buffer.cc \
	src/node_constants.cc \
	src/node_crypto.cc \
	src/node_extensions.cc \
	src/node_file.cc \
	src/node_http_parser.cc \
	src/node_javascript.cc \
	src/node_main.cc \
	src/node_os.cc \
	src/node_script.cc \
	src/node_stat_watcher.cc \
	src/node_string.cc \
	src/node_zlib.cc \
	src/pipe_wrap.cc \
	src/process_wrap.cc \
	src/signal_wrap.cc \
	src/slab_allocator.cc \
	src/stream_wrap.cc \
	src/tcp_wrap.cc \
	src/timer_wrap.cc \
	src/tty_wrap.cc \
	src/udp_wrap.cc \
	src/v8_typed_array.cc

# debug
ifeq ($(debug),true)
LOCAL_CFLAGS += \
	-DDEBUG \
	-g \
	-O0 \
	-Wall \
	-Wextra
endif

# common flags
LOCAL_CFLAGS += \
	-DNODE_WANT_INTERNALS \
	-D_SSIZE_T_ \
	-D__POSIX__ \
	-DX_STACKSIZE=65536 \
	-D_LARGEFILE_SOURCE \
	-D_FILE_OFFSET_BITS=64 \
	-DHAVE_FDATASYNC=1 \
	-DHAVE_MONOTONIC_CLOCK \
	-D_FORTIFY_SOURCE=2 \
	-DPLATFORM=\"android\" \
	-DARCH=\"arch-arm\" \
	-Wno-unused-parameter
	
# node
LOCAL_CFLAGS += \
	-DHAVE_OPENSSL \
	-DNODE_CFLAGS=\"\" \
	-DNODE_PREFIX=\"$(NODE_PREFIX)\" \
	-DNODE_FORK_ISOLATE \
	-include sys/select.h
