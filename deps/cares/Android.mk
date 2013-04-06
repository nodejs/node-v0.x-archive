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
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cares

LOCAL_C_INCLUDES += \
	$(LOCAL_PATH)/include \
	$(LOCAL_PATH)/src \
	$(LOCAL_PATH)/config/android
 
LOCAL_SRC_FILES := \
	src/ares__close_sockets.c \
	src/ares__get_hostent.c \
	src/ares__read_line.c \
	src/ares__timeval.c \
	src/ares_cancel.c \
	src/ares_data.c \
	src/ares_destroy.c \
	src/ares_expand_name.c \
	src/ares_expand_string.c \
	src/ares_fds.c \
	src/ares_free_hostent.c \
	src/ares_free_string.c \
	src/ares_gethostbyaddr.c \
	src/ares_gethostbyname.c \
	src/ares_getnameinfo.c \
	src/ares_getopt.c \
	src/ares_getsock.c \
	src/ares_init.c \
	src/ares_library_init.c \
	src/ares_llist.c \
	src/ares_mkquery.c \
	src/ares_nowarn.c \
	src/ares_options.c \
	src/ares_parse_a_reply.c \
	src/ares_parse_aaaa_reply.c \
	src/ares_parse_mx_reply.c \
	src/ares_parse_naptr_reply.c \
	src/ares_parse_ns_reply.c \
	src/ares_parse_ptr_reply.c \
	src/ares_parse_srv_reply.c \
	src/ares_parse_txt_reply.c \
	src/ares_process.c \
	src/ares_query.c \
	src/ares_search.c \
	src/ares_send.c \
	src/ares_strcasecmp.c \
	src/ares_strdup.c \
	src/ares_strerror.c \
	src/ares_timeout.c \
	src/ares_version.c \
	src/ares_writev.c \
	src/bitncmp.c \
	src/inet_net_pton.c \
	src/inet_ntop.c

# debug
ifeq ($(debug),true)
LOCAL_CFLAGS += \
	-g \
	--std=gnu89 \
	-pedantic \
	-Wall \
	-Wextra \
	-Wno-unused-parameter
endif

# ares
LOCAL_CFLAGS += \
	'-D_DARWIN_USE_64_BIT_INODE=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D_GNU_SOURCE' \
	'-DHAVE_CONFIG_H' \
	'-DCARES_STATICLIB'

LOCAL_EXPORT_C_INCLUDES := \
	$(LOCAL_PATH)/include

include $(BUILD_STATIC_LIBRARY)
